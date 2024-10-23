import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
  } from '@nestjs/websockets';
  import { Socket } from 'socket.io';
  import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
  import { Participant, ChatDto, toMessageDto, RoomData, RoomDto } from "./dto/chat.dto";
  
  @WebSocketGateway()
  export class ChatWebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server;
  
    private static participants: Map<string, { username: string, roomId: string }> = new Map(); 
    private static rooms: Map<string, RoomData> = new Map();
  
    handleConnection(socket: Socket): void {
        const socketId = socket.id;
        console.log(`New connection... socket id:`, socketId);
        
        ChatWebsocketGateway.participants.set(socketId, { username: '', roomId: '' });
    }
  
    handleDisconnect(socket: Socket): void {
        const socketId = socket.id;
        console.log(`Disconnection... socket id:`, socketId);
  
        const participant = ChatWebsocketGateway.participants.get(socketId);
        if (!participant) return;
        
        const roomId = participant.roomId;
        const room = ChatWebsocketGateway.rooms.get(roomId);
  
        if (room) {
            room.participants.get(socketId).connected = false;
            this.server.emit(
                `participants/${roomId}`,
                Array.from(room.participants.values()),
            );
        }
    }
  
    private static generateRoomId(username1: string, username2: string): string {
      return [username1, username2].sort().join('-'); 
    }
  
    @SubscribeMessage('startChat')
    async onStartChat(socket: Socket, { friendUsername }: { friendUsername: string }) {
      const participant = ChatWebsocketGateway.participants.get(socket.id); 
      if (!participant || !participant.username) {
          socket.emit('error', { message: 'Usuário não encontrado ou não autenticado.' });
          return;
      }
  
      const currentUsername = participant.username;
      const roomId = ChatWebsocketGateway.generateRoomId(currentUsername, friendUsername);
  
      try {
          const roomData: RoomDto = { roomId, creatorUsername: currentUsername };
          ChatWebsocketGateway.createRoom(roomData);
          socket.join(roomId);
          console.log(`Socket ${socket.id} joined room ${roomId}`);
      } catch (error) {
          socket.emit('error', { message: error.message });
      }
    }
  
    @SubscribeMessage('createRoom')
    async onCreateRoom(socket: Socket, roomData: RoomDto) {
      try {
          ChatWebsocketGateway.createRoom(roomData);
          socket.join(roomData.roomId);
      } catch (error) {
          console.error('Failed to create room:', error);
          socket.emit('error', { message: error.message });
      }
    }
  
    @SubscribeMessage('participants')
    async onParticipate(socket: Socket, participant: Participant) {
        const socketId = socket.id;
        const roomId = participant.roomId;
        const username = participant.username;
  
        if (!ChatWebsocketGateway.rooms.has(roomId)) {
            console.error('Room not found, disconnecting the participant');
            socket.disconnect();
            throw new ForbiddenException('Access forbidden');
        }
  
        const room = ChatWebsocketGateway.rooms.get(roomId);
  
        ChatWebsocketGateway.participants.set(socketId, { username, roomId }); 
        participant.connected = true;
        room.participants.set(socketId, participant);
  
        this.server.emit(`participants/${roomId}`, Array.from(room.participants.values()));
    }
  
    @SubscribeMessage('exchanges')
    async onMessage(socket: Socket, message: ChatDto) {
      const socketId = socket.id;
      message.socketId = socketId;
      console.log('Received new message... socketId: %s, message: ', socketId, message);
      
      const roomId = message.roomId;
      const roomData = ChatWebsocketGateway.get(roomId);
      message.order = roomData.messages.length + 1; 
      roomData.messages.push(message);
      
      ChatWebsocketGateway.rooms.set(roomId, roomData);
      
      this.server.to(roomId).emit('message', toMessageDto(message)); 
    }
  
    static get(roomId: string): RoomData | undefined {
        return this.rooms.get(roomId);
    }
  
    static createRoom(roomDto: RoomDto): void {
        const roomId = roomDto.roomId;
        if (this.rooms.has(roomId)) {
            throw new ConflictException({ code: 'room.conflict', message: `Room '${roomId}' already exists` });
        }
        this.rooms.set(roomId, new RoomData(roomDto.creatorUsername));
    }
  
    static close(roomId: string) {
        if (!this.rooms.has(roomId)) {
            throw new NotFoundException({ code: 'room.not-found', message: `Room '${roomId}' not found` });
        }
        this.rooms.delete(roomId);
    }
  }
  
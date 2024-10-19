import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { FriendshipService } from '../friends/friendship.service';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private users: { [username: string]: Socket } = {};

  constructor(
    private readonly chatService: ChatService,
    private readonly friendshipService: FriendshipService,
  ) {}

  @SubscribeMessage('message')
  async handleMessage(@MessageBody() data: SendMessageDto, client: Socket) {
    const { to, message } = data;

    const recipientSocket = this.users[data.to];

    const areFriends = await this.friendshipService.areFriends(Number(client.id), Number(to));

    if (!areFriends) {
      client.emit('error', { message: `Você não pode enviar mensagens para ${to}. Vocês não são seus amigos.` });
      return;
    }

    if (recipientSocket) {
      recipientSocket.emit('message', {
        sender: client.id,
        message: data.message,
      });

      await this.chatService.saveMessage(data);
    } else {
      client.emit('error', { message: `Usuário ${data.to} não está conectado.` });
    }
  }

  handleConnection(client: Socket) {
    const username = Array.isArray(client.handshake.query.username)
      ? client.handshake.query.username[0]
      : client.handshake.query.username;

    if (username) {
      this.users[username] = client;
      console.log(`${username} conectado`);
    } else {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const username = Object.keys(this.users).find(key => this.users[key] === client);
    
    if (username) {
      delete this.users[username];
      console.log(`${username} desconectado`);
    }
  }
}

import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtService } from '@nestjs/jwt'; 
import { AuthenticatedSocket } from './authenticated-socket.interface'; 

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;

    constructor(
        private readonly chatService: ChatService,
        private readonly jwtService: JwtService
    ) {}

    afterInit(server: Server) {
    }

    async handleConnection(client: AuthenticatedSocket) {
        const token = client.handshake.auth.token; 
        if (!token) return client.disconnect();

        try {
            const decoded = await this.jwtService.verifyAsync(token);
            client.user = decoded; 
            console.log(`Client connected: ${client.id}, User ID: ${decoded.id}`);
        } catch (error) {
            console.error('Authentication error:', error);
            client.disconnect();
        }
    }

    handleDisconnect(client: AuthenticatedSocket) {
    }

    @SubscribeMessage('sendMessage')
    async handleMessage(client: AuthenticatedSocket, createMessageDto: CreateMessageDto) {
        const senderId = client.user?.id; 
        if (!senderId) {
            return;
        }

        const message = await this.chatService.createMessage(createMessageDto, senderId);
        this.server.emit('message', message);
    }

    @SubscribeMessage('joinChat')
    handleJoinChat(client: AuthenticatedSocket, userId: number) {
        client.join(userId.toString());
    }
}

import { Module } from '@nestjs/common';
import { ChatWebsocketGateway } from './chat.websocket.gateway';
import { ChatService } from './chat.service';
import { RoomsController } from './rooms.controller';

@Module({
    providers: [ChatWebsocketGateway, ChatService],
    controllers: [RoomsController],
})
export class ChatModule {}

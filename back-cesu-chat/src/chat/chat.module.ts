import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';
import { Message } from './message.entity';
import { FriendshipModule } from '../friends/friendship.module'; 

@Module({
  imports: [TypeOrmModule.forFeature([Message]), FriendshipModule], 
  providers: [ChatService, ChatGateway],
  controllers: [ChatController],
})
export class ChatModule {}

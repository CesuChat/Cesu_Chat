import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { Message } from './message.entity';
import { JwtModule } from '@nestjs/jwt'; 
import { GroupModule } from '../group/group.module'; 
import { UsersModule } from '../users/users.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Message]),
        JwtModule.register({
            secret: 'lmevgf_CesuChat', 
            signOptions: { expiresIn: '60m' }, 
        }),
        GroupModule, 
        UsersModule, 
    ],
    providers: [ChatGateway, ChatService],
    controllers: [ChatController],
})
export class ChatModule {}

import { Injectable } from '@nestjs/common';
import { Message } from './message.entity'; 
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMessageDto } from './dto/create-message.dto'; 


@Injectable()
export class ChatService {
    constructor(
        @InjectRepository(Message)
        private readonly messageRepository: Repository<Message>,
    ) {}

    async createMessage(createMessageDto: CreateMessageDto, senderId: number): Promise<Message> {
        const message = this.messageRepository.create({
            content: createMessageDto.content,
            sender: { id: senderId }, 
            receiver: { id: createMessageDto.receiverId },
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        
        await this.messageRepository.save(message);
        return message;
    }

    async getMessagesBetweenUsers(userId1: number, userId2: number, take: number = 80): Promise<Message[]> {
        return this.messageRepository.createQueryBuilder('message')
            .leftJoinAndSelect('message.sender', 'sender') 
            .leftJoinAndSelect('message.receiver', 'receiver') 
            .where(
                '(message.senderId = :userId1 AND message.receiverId = :userId2) OR (message.senderId = :userId2 AND message.receiverId = :userId1)', 
                { userId1, userId2 }
            )
            .orderBy('message.createdAt', 'ASC')
            .take(take)
            .getMany();
    }
}

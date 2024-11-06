import { Injectable } from '@nestjs/common';
import { Message } from './message.entity'; 
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMessageDto } from './dto/create-message.dto'; 
import { Group } from '../group/group.entity';


@Injectable()
export class ChatService {
    constructor(
        @InjectRepository(Group)
        private groupRepository: Repository<Group>,
        @InjectRepository(Message)
        private messageRepository: Repository<Message>,
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

    async getRecentConversations(userId: number): Promise<any[]> {
        const userConversations = await this.messageRepository
            .createQueryBuilder('message')
            .leftJoinAndSelect('message.receiver', 'receiver')
            .leftJoinAndSelect('message.sender', 'sender')
            .where('(message.sender.id = :userId OR message.receiver.id = :userId)', { userId })
            .orderBy('message.createdAt', 'DESC')
            .take(5)
            .getMany();
    
        const groupConversations = await this.groupRepository.find({
            relations: ['members', 'messages'],
        });
    
        const conversationsMap = new Map();
    
        userConversations.forEach(message => {
            const otherUserId = message.sender.id === userId ? message.receiver.id : message.sender.id;
            const conversationKey = `user-${otherUserId}`;
            const lastMessage = message.content;
    
            if (!conversationsMap.has(conversationKey)) {
                conversationsMap.set(conversationKey, {
                    id: conversationKey,
                    lastMessage,
                    timestamp: message.createdAt,
                    withUserId: otherUserId,
                    friendUsername: message.sender.id === userId ? message.receiver.username : message.sender.username,
                    friendPhoto: message.sender.id === userId ? message.receiver.photo : message.sender.photo,
                    isGroup: false,
                });
            }
        });
    
        groupConversations.forEach(group => {
            const lastMessage = group.messages.length > 0
                ? group.messages[group.messages.length - 1].content
                : `${group.members[0].username} criou o grupo`;
            const conversationKey = `group-${group.id}`;
    
            if (!conversationsMap.has(conversationKey)) {
                conversationsMap.set(conversationKey, {
                    id: group.id,
                    lastMessage,
                    timestamp: group.messages.length > 0 ? group.messages[group.messages.length - 1].createdAt : new Date(),
                    friendUsername: group.name,
                    isGroup: true,
                });
            }
        });
    
        return Array.from(conversationsMap.values());
    }      
}    

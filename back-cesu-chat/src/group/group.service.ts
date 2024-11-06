import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from './group.entity';
import { GroupMessage } from './group-message.entity';
import { User } from '../users/user.entity';
import { ChatGateway } from '../chat/chat.gateway';
import { ChatService } from 'src/chat/chat.service';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(GroupMessage)
    private readonly groupMessageRepository: Repository<GroupMessage>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @Inject(forwardRef(() => ChatGateway))
    private readonly chatGateway: ChatGateway, 
    @Inject(forwardRef(() => ChatService)) 
    private readonly chatService: ChatService,
  ) {}
  

  async createGroup(name: string, members: number[], creatorId: number): Promise<Group> {
    const creator = await this.usersRepository.findOne({ where: { id: creatorId } });
    if (!creator) throw new Error('Creator not found');

    const group = this.groupRepository.create({ name });
    group.members = members.map(memberId => ({ id: memberId } as User)); 

    const savedGroup = await this.groupRepository.save(group);

    const messageContent = `Grupo ${group.name} criado com sucesso!`;
    
    await this.chatGateway.handleGroupMessage({ user: { id: creatorId } } as any, { groupId: savedGroup.id, content: messageContent });

    return savedGroup;
  }

  async addMessageToGroup(groupId: number, sender: User, content: string): Promise<GroupMessage> {
    const group = await this.groupRepository.findOne({ where: { id: groupId } });
    if (!group) throw new Error('Group not found');

    const message = this.groupMessageRepository.create({ group, sender, content });
    return this.groupMessageRepository.save(message);
  }

  async addMemberToGroup(groupId: number, user: User): Promise<Group> {
    const group = await this.groupRepository.findOne({ where: { id: groupId }, relations: ['members'] });
    if (!group) throw new Error('Group not found');

    group.members.push(user);
    return this.groupRepository.save(group);
  }

  async getAllGroupsWithMembers(): Promise<any[]> {
    const groups = await this.groupRepository.find({
      relations: ['members'], 
    });

    return groups.map(group => ({
      id: group.id,
      name: group.name,
      members: group.members.map(member => ({
        id: member.id,
        username: member.username,
        photo: member.photo,
      })),
    }));
  }

  async getAllGroupsWithMessages(userId: number): Promise<any[]> {
    const groups = await this.groupRepository.find({
        relations: ['members', 'messages'], 
    });

    return groups.map(group => {
        const lastMessage = group.messages.length > 0
            ? group.messages[group.messages.length - 1].content
            : `${group.members[0].username} criou o grupo`; 

        return {
            id: group.id,
            name: group.name,
            members: group.members.map(member => ({
                id: member.id,
                username: member.username,
                photo: member.photo,
            })),
            lastMessage,
            timestamp: group.messages.length > 0 ? group.messages[group.messages.length - 1].createdAt : new Date(),
        };
    });
  }

  async getGroupMembers(groupId: number): Promise<User[]> {
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
      relations: ['members'], 
    });

    return group ? group.members : [];
  }

  async getMessagesByGroupId(groupId: number): Promise<GroupMessage[]> {
    return await this.groupMessageRepository.find({
      where: { group: { id: groupId } },
      relations: ['sender'], 
    });
  }

  async findGroupById(groupId: number): Promise<Group | undefined> {
    return await this.groupRepository.findOne({
      where: { id: groupId },
      relations: ['members'],
    });
  }
}

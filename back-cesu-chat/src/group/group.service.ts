import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from './group.entity';
import { GroupMessage } from './group-message.entity';
import { User } from '../users/user.entity';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(GroupMessage)
    private groupMessageRepository: Repository<GroupMessage>,
  ) {}

  async createGroup(name: string, members: number[]): Promise<Group> {
    const group = this.groupRepository.create({ name });
    group.members = members.map(memberId => ({ id: memberId } as User)); 
    return await this.groupRepository.save(group);
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

  async getGroupMembers(groupId: number): Promise<User[]> {
    const group = await this.groupRepository.findOne({
        where: { id: groupId },
        relations: ['members'], 
    });

    return group ? group.members : [];
    }

  async findGroupById(groupId: number): Promise<Group | undefined> {
    return await this.groupRepository.findOne({
      where: { id: groupId },
      relations: ['members'],
    });
  }
}

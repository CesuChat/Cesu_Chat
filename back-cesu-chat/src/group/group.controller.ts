import { Controller, Post, Body, Param, ParseIntPipe, Get } from '@nestjs/common';
import { GroupService } from './group.service';
import { User } from '../users/user.entity';
import { Group } from './group.entity';

@Controller('groups')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  async createGroup(@Body('name') name: string, @Body('members') members: number[]): Promise<Group> {
    return this.groupService.createGroup(name, members);
  }

  @Post(':groupId/message')
  async addMessageToGroup(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Body('sender') sender: User,
    @Body('content') content: string,
  ) {
    return this.groupService.addMessageToGroup(groupId, sender, content);
  }

  @Post(':groupId/members')
  async addMemberToGroup(@Param('groupId', ParseIntPipe) groupId: number, @Body('user') user: User) {
    return this.groupService.addMemberToGroup(groupId, user);
  }

  @Get(':id/members')
    async getGroupMembers(@Param('id') id: number): Promise<User[]> {
        return this.groupService.getGroupMembers(id);
    }
}

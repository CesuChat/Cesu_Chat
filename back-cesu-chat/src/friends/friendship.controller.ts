import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import { UsersService } from '../users/users.service';

@Controller('friendship')
export class FriendshipRequestController {
  constructor(
    private readonly friendshipService: FriendshipService,
    private readonly usersService: UsersService,
) {}

  @Post('send')
  async sendRequest(@Body() body: { fromId: number; toId: number }) {
    const fromUser = await this.usersService.findOne(body.fromId); 
    const toUser = await this.usersService.findOne(body.toId); 
    return await this.friendshipService.sendFriendshipRequest(fromUser, toUser);
  }

  @Post('accept/:id')
  async acceptRequest(@Param('id') id: number) {
    return await this.friendshipService.acceptFriendshipRequest(id);
  }

  @Post('decline/:id')
  async declineRequest(@Param('id') id: number) {
    return await this.friendshipService.declineFriendshipRequest(id);
  }

  @Get('pending/:userId')
  async getPendingRequests(@Param('userId') userId: number) {
    return await this.friendshipService.getPendingRequests(userId);
  }
}

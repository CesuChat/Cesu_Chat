import { Controller, Post, Body, Get, Param, Request, NotFoundException, UnauthorizedException, UseGuards, Patch, Delete } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FriendshipService } from './friendship.service';
import { UsersService } from '../users/users.service';
import { FriendshipRequestDTO } from './dto/friendship-request.dto';

@Controller('friendship')
export class FriendshipRequestController {
  constructor(
    private readonly friendshipService: FriendshipService,
    private readonly usersService: UsersService,
) {}

  @UseGuards(AuthGuard('jwt')) 
  @Get('received-requests')
  async getReceivedRequests(@Request() req): Promise<FriendshipRequestDTO[]> {
    const userId = req.user.id; 
    const requests = await this.friendshipService.getReceivedFriendRequests(userId);
    return requests; 
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('remove-friend/:friendId')
  async removeFriend(@Request() req, @Param('friendId') friendId: string) {
      const userId = req.user.id; 
      await this.friendshipService.deleteFriend(userId, friendId);
      return { message: 'Amigo removido com sucesso' };
  }  

  @UseGuards(AuthGuard('jwt'))
  @Post('send-friend-request')
  async sendFriendRequest(@Request() req, @Body() body: { toId: number }) {
      if (!req.user) {
          throw new UnauthorizedException('Usuário não autenticado');
      }
  
      const fromId = req.user.id;
      const toUser = await this.usersService.findOne(body.toId);
      
      if (!toUser) {
          throw new NotFoundException('Usuário não encontrado');
      }
  
      return await this.friendshipService.sendFriendshipRequest(fromId, toUser.id); 
  }
  
  @UseGuards(AuthGuard('jwt'))
  @Patch('accept/:id')
  async acceptFriendRequest(@Param('id') requestId: number): Promise<{ message: string }> {
    await this.friendshipService.acceptFriendshipRequest(requestId);
    return { message: 'Friend request accepted.' };
  }
  
  @UseGuards(AuthGuard('jwt'))
  @Patch('decline/:id')
  async declineFriendRequest(@Param('id') requestId: number): Promise<{ message: string }> {
    await this.friendshipService.declineFriendshipRequest(requestId);
    return { message: 'Friend request declined.' };
  }
}

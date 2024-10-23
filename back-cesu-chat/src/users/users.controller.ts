import { Controller, Get, Post, Body, UseGuards, NotFoundException, Request, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { FriendshipService } from '../friends/friendship.service';
import { AuthGuard } from '@nestjs/passport';
import { IsNotEmpty, IsNumber } from 'class-validator';

class SendFriendRequestDto {
  @IsNotEmpty()
  @IsNumber()
  toId: number;
}

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly friendshipService: FriendshipService,
  ) {}

  @Get('friends')
  async getFriends(@Request() req) {
    const userId = req.user.id; 
    const friends = await this.friendshipService.getFriends(userId);
    
    if (friends.length === 0) {
      return { message: "Você não tem amigos ainda" }; 
    }
    
    return friends;
  }

  @Get('find-by-username/:username')
async findByUsername(@Param('username') username: string) {
    const user = await this.usersService.findByUsername(username);
    if (!user) {
        throw new NotFoundException('Usuário não encontrado');
    }
    return { id: user.id };
}

  @Post('send-friend-request')
  async sendFriendRequest(@Request() req, @Body() body: SendFriendRequestDto) {
    const fromId = req.user.id; 
    const toUser = await this.usersService.findOne(body.toId);
    
    if (!toUser) {
      throw new NotFoundException(`Usuário com ID ${body.toId} não encontrado`);
    }

    await this.friendshipService.sendFriendshipRequest(fromId, toUser.id); 
    return {
      message: 'Solicitação de amizade enviada com sucesso.',
      request: {
        fromId,
        toId: toUser.id,
      },
    };
  }
}

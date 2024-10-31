import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    @UseGuards(JwtAuthGuard)
    @Get('messages/:friendId')
    async getMessages(@Param('friendId') friendId: number, @Req() req: any) {
        const userId = req.user.id;
        return this.chatService.getMessagesBetweenUsers(userId, friendId);
    }
}

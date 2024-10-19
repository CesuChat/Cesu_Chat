import { Controller, Post, Body } from '@nestjs/common';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('send-message')
  async sendMessage(@Body() sendMessageDto: SendMessageDto) {
    await this.chatService.saveMessage(sendMessageDto);
    return { message: 'Mensagem enviada com sucesso' };
  }
}

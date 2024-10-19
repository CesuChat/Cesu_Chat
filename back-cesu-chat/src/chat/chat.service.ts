import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SendMessageDto } from './dto/send-message.dto'; 
import { Message } from './message.entity'; 
@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>, 
  ) {}

  async saveMessage(sendMessageDto: SendMessageDto): Promise<Message> {
    const { from, to, message } = sendMessageDto;

    const newMessage = this.messageRepository.create({ from, to, message });

    return await this.messageRepository.save(newMessage);
  }
}

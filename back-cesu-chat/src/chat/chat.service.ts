import { Injectable, NotFoundException } from '@nestjs/common';
import { MessageDto, toMessageDto } from "./dto/chat.dto";
import { ChatWebsocketGateway } from "./chat.websocket.gateway";

@Injectable()
export class ChatService {
    constructor() {}

    getMessages(roomId: string, fromIndex: number, toIndex: number): MessageDto[] {
        const room = ChatWebsocketGateway.get(roomId); 
        if (!room) {
            throw new NotFoundException({ code: 'room.not-found', message: 'Room not found' });
        }
        return room.messages
            .filter((value, index) => index >= fromIndex - 1 && index < toIndex)
            .map(toMessageDto);
    }
}

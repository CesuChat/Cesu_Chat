import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Body,
  HttpCode,
  ParseIntPipe,
  Query,
  DefaultValuePipe,
} from "@nestjs/common";
import { ChatWebsocketGateway } from "./chat.websocket.gateway";
import { RoomDto } from "./dto/chat.dto";
import { MessageDto } from "./dto/chat.dto"; 
import { ChatService } from './chat.service';

@Controller('/api/v1/rooms')
export class RoomsController {
  constructor(private readonly chatService: ChatService) {}
  @Post()
  @HttpCode(201)
  createRoom(@Body() roomDto: RoomDto): void {
      console.log("Creating chat room...", roomDto);
      try {
          return ChatWebsocketGateway.createRoom(roomDto);
      } catch (e) {
          console.error('Failed to initiate room', e);
          throw e;
      }
  }

  @Get('/:roomId/messages')
  getRoomMessages(@Param('roomId') roomId: string,
                  @Query('fromIndex', new ParseIntPipe(), new DefaultValuePipe(0)) fromIndex: number,
                  @Query('toIndex', new ParseIntPipe(), new DefaultValuePipe(0)) toIndex: number): MessageDto[] {
      console.log("Retrieving room messages...", roomId);
      if (fromIndex <= 0 || toIndex <= 0 || fromIndex > toIndex) {
          throw new BadRequestException({ code: 'req-params.validation', message: "Invalid parameters" });
      }

      try {
          return this.chatService.getMessages(roomId, fromIndex, toIndex);
      } catch (e) {
          console.error('Failed to get room messages', e);
          throw e;
      }
  }

  @Delete('/:roomId')
  @HttpCode(204)
  closeRoom(@Param('roomId') roomId: string): void {
      console.log("Deleting room...", roomId);
      try {
          ChatWebsocketGateway.close(roomId);
      } catch (e) {
          console.error('Failed to close room', e);
          throw e;
      }
  }
}

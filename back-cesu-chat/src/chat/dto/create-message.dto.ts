import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMessageDto {
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  receiverId: number;
}

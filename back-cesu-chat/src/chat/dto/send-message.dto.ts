import { IsString, IsNotEmpty } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  from: string;  

  @IsString()
  @IsNotEmpty()
  to: string;    

  @IsString()
  @IsNotEmpty()
  message: string;  
}

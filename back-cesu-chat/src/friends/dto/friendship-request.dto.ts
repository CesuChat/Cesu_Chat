import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class FriendshipRequestDTO {
  @IsInt()
  id: number;

  @IsInt()
  fromId: number; 

  @IsString()
  @IsNotEmpty()
  fromUsername: string; 

  @IsString()
  @IsNotEmpty()
  status: 'pending' | 'accepted' | 'declined'; 
}

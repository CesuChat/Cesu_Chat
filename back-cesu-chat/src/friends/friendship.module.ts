import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendshipService } from './friendship.service';
import { Friendship } from './friendship.entity'; 
import { FriendshipRequest } from './friendship.request'; 
import { FriendshipRequestController } from './friendship.controller';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Friendship, FriendshipRequest]),
        UsersModule, 
      ],
  providers: [FriendshipService],
  controllers: [FriendshipRequestController], 
  exports: [FriendshipService],
})
export class FriendshipModule {}

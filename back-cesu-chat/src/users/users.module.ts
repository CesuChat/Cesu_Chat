import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './user.entity'; 
import { UsersController } from './users.controller';
import { FriendshipModule } from '../friends/friendship.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), forwardRef(() => FriendshipModule)], 
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], 
})
export class UsersModule {}

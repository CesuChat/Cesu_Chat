import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { Group } from './group.entity';
import { GroupMessage } from './group-message.entity';
import { ChatModule } from '../chat/chat.module';
import { UsersModule } from '../users/users.module';
import { User } from '../users/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Group, GroupMessage, User]),
    forwardRef(() => ChatModule), 
    UsersModule,
  ],
  providers: [GroupService],
  controllers: [GroupController],
  exports: [GroupService], 
})
export class GroupModule {}

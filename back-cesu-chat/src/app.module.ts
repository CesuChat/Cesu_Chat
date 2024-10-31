import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; 
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ChatModule } from './chat/chat.module';
import { User } from './users/user.entity'; 
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { Friendship } from './friends/friendship.entity';
import { FriendshipRequest } from './friends/friendship.request';
import { FriendshipModule } from './friends/friendship.module';
import { Message } from './chat/message.entity';
import { GroupModule } from './group/group.module';
import { Group } from './group/group.entity';
import { GroupMessage } from './group/group-message.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'front-cesu-chat', 'login'), 
      serveRoot: '/', 
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'chatcesu',
      password: 'chatcesu123',
      database: 'chatcesu',
      entities: [User, Friendship, FriendshipRequest, Message, Group, GroupMessage], 
      synchronize: true, 
    }),
    AuthModule,
    UsersModule,
    ChatModule,
    GroupModule,
    FriendshipModule,
  ],
})
export class AppModule {}

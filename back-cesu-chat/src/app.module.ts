import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; 
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ChatModule } from './chat/chat.module';
import { User } from './users/user.entity'; 
import { Message } from './chat/message.entity'; 
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'front-cesu-chat'),
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'chatcesu',
      password: 'chatcesu123',
      database: 'chatcesu',
      entities: [User, Message], 
      synchronize: true, 
    }),
    AuthModule,
    UsersModule,
    ChatModule,
  ],
})
export class AppModule {}

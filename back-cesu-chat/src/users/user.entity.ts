import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToMany } from 'typeorm';
import { Friendship } from '../friends/friendship.entity';
import { FriendshipRequest } from '../friends/friendship.request';
import { Message } from 'src/chat/message.entity';
import { Group } from 'src/group/group.entity';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column()
  curse: string;

  @Column({ nullable: true })
  photo: string;

  @Column({ default: false })
  isActive: boolean;

  @Column({ nullable: true })
  verificationToken: string;

  @Column({ nullable: true })
  resetToken: string; 

  @OneToMany(() => Friendship, friendship => friendship.requester)
  friendships: Friendship[];

  @OneToMany(() => Friendship, friendship => friendship.receiver)
  friends: Friendship[];

  @OneToMany(() => FriendshipRequest, request => request.from)
  sentRequests: FriendshipRequest[];

  @OneToMany(() => FriendshipRequest, request => request.to)
  receivedRequests: FriendshipRequest[];

  @OneToMany(() => Message, message => message.sender)
  sentMessages: Message[];

  @ManyToMany(() => Group, group => group.members)
  groups: Group[];
}

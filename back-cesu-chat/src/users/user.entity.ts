import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Friendship } from '../friends/friendship.entity';
import { FriendshipRequest} from '../friends/friendship.request';

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

  @Column({ default: false })
  isActive: boolean;

  @Column({ nullable: true })
  verificationToken: string;

  @Column({ nullable: true })
  resetToken: string; 

  @OneToMany(() => Friendship, friendship => friendship.user)
  friendships: Friendship[];

  @OneToMany(() => FriendshipRequest, request => request.from)
  sentRequests: FriendshipRequest[];

  @OneToMany(() => FriendshipRequest, request => request.to)
  receivedRequests: FriendshipRequest[];
}

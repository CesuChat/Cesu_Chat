import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { User } from '../users/user.entity'; 

@Entity('friendship_request')
export class FriendshipRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.sentRequests)
  from: User; 

  @ManyToOne(() => User, user => user.receivedRequests)
  to: User; 

  @Column({ default: 'pending' })
  status: 'pending' | 'accepted' | 'declined'; 
}

import { Entity, PrimaryGeneratedColumn, ManyToOne, Column} from 'typeorm';
import { User } from '../users/user.entity'; 

@Entity()
export class Friendship {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.friendships)
  requester: User; // Remetente da amizade

  @ManyToOne(() => User, user => user.friendships)
  receiver: User; // Destinatário da amizade

  @Column({ default: 'accepted' })
  status: 'pending' | 'accepted' | 'declined';
}

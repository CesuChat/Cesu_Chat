import { Entity, PrimaryGeneratedColumn, ManyToOne} from 'typeorm';
import { User } from '../users/user.entity'; 

@Entity()
export class Friendship {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.friendships)
  user: User; 

  @ManyToOne(() => User, user => user.friendships)
  friend: User; 

}

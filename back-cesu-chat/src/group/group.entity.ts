import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { User } from '../users/user.entity';
import { Message } from '../chat/message.entity';

@Entity()
export class Group {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  photo: string;

  @ManyToMany(() => User, user => user.groups)
  @JoinTable()
  members: User[];

  @OneToMany(() => Message, message => message.group) 
  messages: Message[];

  @CreateDateColumn()
  createdAt: Date;
}

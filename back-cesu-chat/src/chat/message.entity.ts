import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';
import { Group } from '../group/group.entity'; 

@Entity()
export class Message {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    content: string;

    @ManyToOne(() => User, (user) => user.sentMessages)
    sender: User;

    @ManyToOne(() => User, (user) => user.sentMessages)
    receiver: User;

    @ManyToOne(() => Group, group => group.messages, { nullable: true }) 
    group: Group;

    @Column()
    createdAt: Date;

    @Column()
    updatedAt: Date;
}

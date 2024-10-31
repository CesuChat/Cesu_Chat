import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByUsername(username: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { username }, select: ['id', 'username', 'password', 'isActive'] });
  }

  //async findOneByUsername(username: string): Promise<User | null> {
    //return await this.usersRepository.findOne({ where: { username } });
  //}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({ select: ['id', 'username'] });
  }

  async findByIsActive(isActive: boolean): Promise<User[]> {
    return this.usersRepository.find({ where: { isActive } });
  }
  
  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async findById(id: number): Promise<User | undefined> {
    return await this.usersRepository.findOne({ where: { id } });
  }
  
  async findByVerificationToken(token: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { verificationToken: token } });
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { email } });
  }
  
  async findByResetToken(token: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { resetToken: token } });
  }
  
  async update(id: number, userData: Partial<User>): Promise<User> {
    await this.usersRepository.update(id, userData);
    return this.findOne(id); 
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }
}

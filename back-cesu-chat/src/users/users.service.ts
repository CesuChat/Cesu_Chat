import { Injectable } from '@nestjs/common';
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
    return this.usersRepository.findOne({ where: { username }, select: ['id', 'username', 'password'] });
  }
  
  async findOne(id: number): Promise<User> {
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
    return this.usersRepository.findOne({ where: { id } });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }
}

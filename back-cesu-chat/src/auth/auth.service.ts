import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { MailService } from './mail.service'; 
import { v4 as uuidv4 } from 'uuid';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async register(registerUserDto: RegisterUserDto) {
    const { username, password, email, curse } = registerUserDto; 
  
    const existingUserByUsername = await this.usersService.findByUsername(username);
    if (existingUserByUsername) {
      throw new ConflictException('Nome de usuário já em uso.');
    }

    const existingUserByEmail = await this.usersService.findByEmail(email);
    if (existingUserByEmail) {
      throw new ConflictException('E-mail já cadastrado.');
    }
  
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = uuidv4();

    const user = await this.usersService.create({
      username,
      password: hashedPassword,
      email, 
      curse,
      isActive: false, 
      verificationToken, 
    });


    await this.mailService.sendVerificationEmail(email, verificationToken);

    return { message: 'Verifique seu email para ativar a conta.' };
  }

  async verifyEmail(id: number, token: string) {
    const user = await this.usersService.findOne(id);

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    console.log('Token armazenado:', user.verificationToken);

    if (user.verificationToken !== token) {
      throw new UnauthorizedException('Token inválido ou expirado');
    }

    await this.usersService.update(user.id, { isActive: true, verificationToken: null });

    return { message: 'Email verificado com sucesso!' };
  }
  

  async login(loginUserDto: LoginUserDto) {
    const { username, password } = loginUserDto;
  
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Conta inativa. Por favor, ative seu email para continuar.');
    }
  
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Senha incorreta');
    }
  
    const payload = { 
      username: user.username, 
      id: user.id,    
    };
    const token = this.jwtService.sign(payload);
  
    return { accessToken: token };
  }

  async requestPasswordReset(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    user.resetToken = uuidv4(); 
    await this.usersService.update(user.id, user);

    await this.mailService.sendPasswordResetEmail(email, user.resetToken);
    return { message: 'Email enviado para redefinir a senha.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.usersService.findByResetToken(token);
    if (!user) {
      throw new UnauthorizedException('Token inválido ou expirado');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetToken = null; 
    await this.usersService.update(user.id, user);

    return { message: 'Senha redefinida com sucesso.' };
  }
  
}

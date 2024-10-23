import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity'; 

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), 
      ignoreExpiration: false, 
      secretOrKey: 'lmevgf_CesuChat',
    });
  }

  async validate(payload: { id: number; username: string }): Promise<User> {
    const user = await this.usersService.findOne(payload.id); 

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado'); 
    }

    return user; 
  }
}

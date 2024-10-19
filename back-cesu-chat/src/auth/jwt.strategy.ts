import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'lmevgf_CesuChat', 
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findByUsername(payload.username);
    
    if (user) {
      return { 
        id: user.id,       
        username: user.username, 
      };
    }

    return null;
  }
}

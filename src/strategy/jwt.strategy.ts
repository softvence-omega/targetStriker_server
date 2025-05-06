import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { DbService } from 'src/utils/db/db.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    readonly configService: ConfigService,
    private readonly db: DbService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.getOrThrow('JWT_SECRET'),
      ignoreExpiration: false,
    });
  }

  async validate(payload: { 
    sub: string, 
    email: string, 
    roles: string ,
    profileId: string
  }) {
    
    if (!payload) {
      throw new UnauthorizedException('Invalid token');
    }

    
    
    const isExist = await this.db.user.findUnique({
      where: { 
        id: payload.sub,
        email: payload.email 
      },
      select: {
        id: true,
        email: true,
        name: true,
        adminProfile:true,
        clientProfile:true,
        workerProfile:true,
        UserType:true
      }
    });

    if (!isExist) {
      throw new UnauthorizedException('User not found');
    }

    const user = {
      ...payload
    }
    return user;
  }
}
import { Global, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { CommonService } from './services/common.service';
import { LoginService } from './services/login.service';
import { RegisterService } from './services/register.service';
import { JwtService } from '@nestjs/jwt';
import { AuthGateway } from './auth.gateway';
import { ForgetPassService } from './services/forget-pass.service';
import { MeService } from './services/me.service';

@Global()
@Module({
  controllers: [AuthController],
  providers: [CommonService, LoginService, RegisterService, JwtService, AuthGateway, ForgetPassService, MeService],
  exports:[CommonService]
})
export class AuthModule {}

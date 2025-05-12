import { Global, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { CommonService } from './services/common.service';
import { LoginService } from './services/login.service';
import { RegisterService } from './services/register.service';
import { JwtService } from '@nestjs/jwt';

@Global()
@Module({
  controllers: [AuthController],
  providers: [CommonService, LoginService, RegisterService, JwtService],
  exports:[CommonService]
})
export class AuthModule {}

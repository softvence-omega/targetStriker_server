import { Body, Controller, Post } from '@nestjs/common';
import { LoginService } from './services/login.service';
import { LoginDto } from './dto/login.dto';
import { RegisterService } from './services/register.service';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly LoginService: LoginService,
    private readonly RegisterService: RegisterService
  ) {}

  @Post("login")
  async login(@Body() loginDto: LoginDto) {
    return await this.LoginService.login(loginDto);
  }  

  @Post("register")
  async register(@Body() registerDto: RegisterDto) {
    return await this.RegisterService.register(registerDto);
  }
  
}

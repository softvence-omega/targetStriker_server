import { Body, Controller, Delete, Post, Req, UseGuards } from '@nestjs/common';
import { LoginService } from './services/login.service';
import { LoginDto } from './dto/login.dto';
import { RegisterService } from './services/register.service';
import { RegisterDto } from './dto/register.dto';
import { CommonService } from './services/common.service';
import { AuthenticatedRequest } from 'src/common/types/AuthenticatedRequest';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly LoginService: LoginService,
    private readonly RegisterService: RegisterService,
    private readonly commonService: CommonService
  ) {}

  @Post("login")
  async login(@Body() loginDto: LoginDto) {
    return await this.LoginService.login(loginDto);
  }  

  @Post("register")
  async register(@Body() registerDto: RegisterDto) {
    return await this.RegisterService.register(registerDto);
  }

  @Delete("self-destruct")
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async selfDestruct(@Req() req: AuthenticatedRequest) {
    return await this.commonService.deleteUser({
      id: req.user.sub,
    });
  }
  
}

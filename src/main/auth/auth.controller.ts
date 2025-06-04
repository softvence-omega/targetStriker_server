import { Body, Controller, Delete, Get, Post, Req, UseGuards } from '@nestjs/common';
import { LoginService } from './services/login.service';
import { LoginDto } from './dto/login.dto';
import { RegisterService } from './services/register.service';
import { RegisterDto } from './dto/register.dto';
import { CommonService } from './services/common.service';
import { AuthenticatedRequest } from 'src/common/types/AuthenticatedRequest';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ForgetPassService } from './services/forget-pass.service';
import { SendResetCodeDto, VerifyCodeOnlyDto } from './dto/VerifyCodeOnly.Dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { CodeService } from 'src/utils/code/code.service';
import { MeService } from './services/me.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly LoginService: LoginService,
    private readonly RegisterService: RegisterService,
    private readonly commonService: CommonService,
    private readonly forgetPassword: ForgetPassService,
    private readonly code: CodeService,
    private readonly me: MeService
  ) {}

  @Post("login")
  async login(@Body() loginDto: LoginDto) {
    return await this.LoginService.login(loginDto);
  }  

  @Post("register")
  async register(@Body() registerDto: RegisterDto) {
    return await this.RegisterService.register(registerDto);
  }

   @Post('send-password-reset-code')
  sendResetCode(@Body() email: SendResetCodeDto) {
    return this.forgetPassword.sendPasswordResetCode(email);
  }

  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.forgetPassword.resetPassword(dto);
  }

  @Post('verify-reset-code')
  verifyResetCode(@Body() dto: VerifyCodeOnlyDto) {
    return this.code.isCodeValid(dto);
  }


  @Delete("self-destruct")
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async selfDestruct(@Req() req: AuthenticatedRequest) {
    return await this.commonService.deleteUser({
      id: req.user.sub,
    });
  }

  @Get("me")
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async getMe(@Req() req: AuthenticatedRequest) {
    return await this.me.getMe(req.user.email);
  }
  
}

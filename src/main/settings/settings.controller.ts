import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/decorator/roles.decorator';
import { ChangeAdministratorPasswordService } from './services/change-administrator-password.service';
import { ChangeAdminPassChangeDto } from './dto/changePassword.dto';
import { AuthenticatedRequest } from 'src/common/types/AuthenticatedRequest';

@ApiTags('Admin')
@UseGuards(AuthGuard('jwt'))
@Roles('ADMIN')
@ApiBearerAuth()
@Controller('settings')
export class SettingsController {
  constructor(
    private readonly changeAdminPassService: ChangeAdministratorPasswordService,
  ) {}

  @Post('change-admin-password')
  // Add methods for handling settings-related requests here
  async changeAdminPassword(
    @Body() changeAdminPassDto: ChangeAdminPassChangeDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return await this.changeAdminPassService.changeAdminPassword(
      req.user.email,
      changeAdminPassDto,
    );
  }
}

import {
  Body,
  Controller,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CreateService } from './services/create.service';
import { AuthenticatedRequest } from 'src/common/types/AuthenticatedRequest';
import { CreateClientProfileDto } from './dto/createClientProfile.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { RolesGuard } from 'src/guard/role.guard';
import { Roles } from 'src/decorator/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';

@Controller('profile')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class ProfileController {
  constructor(private readonly createService: CreateService) {}

  @Post('create-client-profile')
  @Roles('CLIENT')
  @UseGuards(RolesGuard)
  @ApiConsumes('multipart/form-data','application/json')
  @UseInterceptors(FileInterceptor('profilePic',{
    storage: diskStorage({
            destination: './temp',
            filename: (req, file, cb) => {
              const uniqueSuffix =
                Date.now() + '-' + Math.round(Math.random() * 1e9);
              cb(null, `temp-${uniqueSuffix}${path.extname(file.originalname)}`);
            },
          }),
          limits: {
            fileSize: 10 * 1024 * 1024, // 10MB
          },
          fileFilter: (req, file, cb) => {
            cb(null, true);
          },
  }))
  async createClientProfile(
    @Req() req: AuthenticatedRequest,
    @Body() rawData: CreateClientProfileDto,
    @UploadedFile() profilePic: Express.Multer.File,
  ) {
    const data: CreateClientProfileDto = {
      ...rawData,
      profilePic,
    };
    return await this.createService.createClientProfile(
      { id: req.user.sub },
      data,
    );
  }
}

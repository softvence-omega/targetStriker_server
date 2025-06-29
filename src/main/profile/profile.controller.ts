import {
  Body,
  Controller,
  Post,
  Put,
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
import { FileType, MulterService } from 'src/utils/lib/multer.service';
import { CreateWorkerProfileDto } from './dto/createWrokerProficle.dto';
import { UpdateWorkerProfileDto } from './dto/updateWorkerProfile.dto';
import { UpdateClientProfileDto } from './dto/updateClientProfile.dto';
import { UpdateService } from './services/update.service';

@Controller('profile')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class ProfileController {
  constructor(
    private readonly createService: CreateService,
    private readonly updateService: UpdateService
  ) { }

  @Post('create-client-profile')
  @Roles('CLIENT')
  @UseGuards(RolesGuard)
  @ApiConsumes('multipart/form-data', 'application/json')
  @UseInterceptors(FileInterceptor('profilePic', new MulterService().createMulterOptions('./temp', 'temp', FileType.IMAGE)))
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

  @Post('create-worker-profile')
  @Roles("WORKER")
  @UseGuards(RolesGuard)
  @ApiConsumes('multipart/form-data', 'application/json')
  @UseInterceptors(FileInterceptor('profilePic', new MulterService().createMulterOptions('./temp', 'temp', FileType.IMAGE)))
  async createServiceWorkerProfile(
    @Req() req: AuthenticatedRequest,
    @Body() rawData: CreateWorkerProfileDto,
    @UploadedFile() profilePic: Express.Multer.File,
  ) {
    const data: CreateWorkerProfileDto = {
      ...rawData,
      profilePic,
    };
    return this.createService.createWorkerProfile(
      { id: req.user.sub },
      data,
    )
  }

  @Put('update-client-profile')
  @Roles('CLIENT')
  @UseGuards(RolesGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data', 'application/json')
  @UseInterceptors(FileInterceptor('profilePic', new MulterService().createMulterOptions('./temp', 'temp', FileType.IMAGE)))
  async updateClientProfile(
    @Body() rawData: UpdateClientProfileDto,
    @Req() req: AuthenticatedRequest,
    @UploadedFile() profilePic?: Express.Multer.File,
  ) {
    console.log('[Controller] req.user.sub (authenticated user ID):', req.user.sub);
    console.log('[Controller] rawData received:', rawData);
    if (profilePic) {
      console.log('[Controller] profilePic received:', profilePic.originalname);
    } else {
      console.log('[Controller] No profilePic received');
    }

    const data: UpdateClientProfileDto = {
      ...rawData,
      ...(profilePic && { profilePic }),
    };

    const result = await this.updateService.updateClientProfile(
      { id: req.user.sub },
      data,
    );

    console.log('[Controller] updateClientProfile result:', result);

    return result;
  }

  @Put('update-worker-profile/:id')
  @Roles("WORKER")
  @UseGuards(RolesGuard)
  @ApiConsumes('multipart/form-data', 'application/json')
  @UseInterceptors(FileInterceptor('profilePic', new MulterService().createMulterOptions('./temp', 'temp', FileType.IMAGE)))
  async updateWorkerProfile(
    @Body() rawData: UpdateWorkerProfileDto,
    @Req() req: AuthenticatedRequest,
    @UploadedFile() profilePic?: Express.Multer.File,
  ) {
    const data: UpdateWorkerProfileDto = {
      ...rawData,
      ...(profilePic && { profilePic }),
    };
    return await this.updateService.updateWorkerProfile(
      { id: req.user.sub },
      data,
    );
  }

}

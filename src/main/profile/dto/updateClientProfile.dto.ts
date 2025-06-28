import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateClientProfileDto {
  @ApiPropertyOptional({ description: 'representing the location' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'Unique username of the user' })
  @IsOptional()
  @IsString()
  userName?: string;

  @ApiPropertyOptional({
    description: 'Avatar image for the event preference',
    type: 'string',
    format: 'binary',
  })
  @IsOptional()
  profilePic?: Express.Multer.File;
}
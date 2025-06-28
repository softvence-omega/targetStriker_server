import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateWorkerProfileDto {
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

  @ApiPropertyOptional({ description: 'Unique workerId of the user' })
  @IsOptional()
  @IsString()
  workerId?: string;

  @ApiPropertyOptional({
    description: 'Unique identifier (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'ID must be a valid UUID (version 4).' })
  workerSpecialtyId?: string;
}
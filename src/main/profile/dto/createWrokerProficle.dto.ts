import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsUUID } from 'class-validator';
import { TaskType } from 'generated/prisma';

export class CreateWorkerProfileDto {
  @ApiProperty({ description: 'representing the location' })
  @IsString()
  location: string; // You can use Record<string, any> if you want better typing

  @ApiProperty({ description: 'Unique username of the user' })
  @IsString()
  userName: string;

  @ApiProperty({
    description: 'Avatar image for the event preference',
    type: 'string',
    format: 'binary',
  })
  profilePic: Express.Multer.File;

  @ApiProperty({ description: 'Unique workerId of the user' })
  @IsString()
  workerId: string;

  @ApiProperty({
    description: 'Unique identifier (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4', { message: 'ID must be a valid UUID (version 4).' })
  workerSpecialtyId: string;
}

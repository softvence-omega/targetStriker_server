import {
  IsString,
  IsEmail,
  IsNumber,
  IsEnum,
  IsOptional,
  IsDateString,
  IsNotEmpty,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskType } from 'generated/prisma';

export class CreateServiceRequestDTOWithValidation {
  @ApiProperty({
    description: 'Full name of the person requesting the service',
    example: 'John Doe',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Phone number for contact',
    example: '+31612345678',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({
    description: 'Email address for communication',
    example: 'john.doe@example.com',
    type: String,
    format: 'email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'City where the service is needed',
    example: 'Amsterdam',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({
    description: 'Postal code of the service location',
    example: '1012AB',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  postalCode: string;

  @ApiProperty({
    description: 'Detailed description of the service location',
    example: 'Second floor apartment, building entrance on the left side',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  locationDescription: string;

  @ApiProperty({
    description: 'Numeric identifier for the task type',
    example: 1,
    type: Number,
  })
  @IsNumber()
  taskTypeId: number;

  @ApiProperty({
    description:
      'Detailed description of the problem that needs to be addressed',
    example:
      'Mold growth detected in bathroom ceiling, approximately 2 square meters affected',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  problemDescription: string;

  @ApiProperty({
    description: 'Photo showing the problem (required)',
    type: 'string',
    format: 'binary',
    required: true,
  })
  @IsNotEmpty()
  reqPhoto: Buffer | Express.Multer.File;

  @ApiProperty({
    description: 'Preferred time for the service',
    example: '14:00-16:00',
    type: String,
  })
  @IsDateString()
  preferredTime?: string;

  @ApiProperty({
    description: 'Preferred date for the service',
    example: '2024-12-25T10:00:00Z',
    type: String,
    format: 'date-time',
  })
  @IsDateString()
  preferredDate: Date;

  @ApiProperty({
    description: 'Type of task/service being requested',
    enum: TaskType,
    example: TaskType.SCHIMMEL_INSPECTIES_BEHANDELINGEN,
    enumName: 'TaskType',
  })
  @IsEnum(TaskType)
  taskType: TaskType;
}

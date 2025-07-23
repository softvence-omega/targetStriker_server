import {
  IsString,
  IsEmail,
  IsNumber,
  IsEnum,
  IsDateString,
  IsNotEmpty,
  MaxLength,
  IsInt,
  Min,
  IsUUID,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TaskType } from 'generated/prisma';
import { Transform } from 'class-transformer';
import { BadRequestException } from '@nestjs/common';

export class CreateServiceRequestWithAssignDTO {


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
  reqPhoto?: Express.Multer.File; //

  @ApiProperty({
    description: 'Preferred time for the service',
    example: '14:00-16:00',
    type: String,
  })
  @IsDateString()
  preferredTime: string;

  @ApiProperty({
    description: 'Preferred date for the service',
    example: '2024-12-25T10:00:00Z',
    type: String,
    format: 'date-time',
  })
  @IsDateString()
  preferredDate: string;

  @ApiProperty({
    description: 'Unique identifier (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4', { message: 'ID must be a valid UUID (version 4).' })
  taskTypeId: string;

  @ApiProperty({
    description: 'The name of the task',
    example: 'Schimmel inspectie woonkamer',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255, { message: 'Task name must not exceed 255 characters' })
  name: string;

  @ApiProperty({
        description: 'The ID of the worker to assign the service request to',
        example: '123e4567-e89b-12d3-a456-426614174000',
        type: String,
    })
    @IsUUID('4', { message: 'Worker ID must be a valid UUID (version 4).' })
    @IsNotEmpty({ message: 'Worker ID is required' })
    workerId: string;


  // @ApiProperty({
  //   description:
  //     'The price of the task in cents (to avoid floating point issues)',
  //   example: 15000,
  //   minimum: 0,
  // })
  // @IsInt()
  // @Transform(({ value }) => {
  //   if (typeof value === 'string') {
  //     const parsed = parseInt(value, 10);
  //     if (Number.isNaN(parsed)) {
  //       throw new BadRequestException('Price must be a valid number');
  //     }
  //     return parsed;
  //   }
  //   return value;
  // })
  // @Min(0, { message: 'Price must be a positive integer' })
  // price: number;
}

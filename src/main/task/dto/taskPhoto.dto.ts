import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class TaskPhotoDto {
  @ApiPropertyOptional({
    description: 'Whether this is a preview photo',
    default: false,
    example: false,
  })
  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  isPrev?: boolean;

  @ApiProperty({
    description: 'Avatar image for the event preference',
    type: 'string',
    format: 'binary',
  })
  pic: Express.Multer.File;

  @ApiProperty({
    description: 'Caption for the photo',
    example: 'Photo caption here',
  })
  @IsString()
  @IsNotEmpty()
  caption: string;
}

export class ReportPhotosDto {
  @ApiProperty({
    description: 'Array of report photos',
    type: [TaskPhotoDto],
    isArray: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaskPhotoDto)
  photos: TaskPhotoDto[];
}

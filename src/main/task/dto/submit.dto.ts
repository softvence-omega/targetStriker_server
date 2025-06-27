import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class SubmitDto {
  @ApiProperty({
    description: 'Photo showing the problem (required)',
    type: 'string',
    format: 'binary',
    required: true,
  })
  signature?: Express.Multer.File;

   @ApiProperty({
    description: 'Rating out of 5',
    example: 4,
    default: 0,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({
    description: 'Optional review text',
    example: 'Great experience!',
  })
  @IsOptional()
  @IsString()
  review?: string;
}

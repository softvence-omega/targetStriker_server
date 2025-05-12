import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsJSON, IsOptional, IsString } from 'class-validator';

export class CreateClientProfileDto {
  @ApiPropertyOptional({ description: 'JSON object representing the location' })
  @IsOptional()
  @IsJSON()
  location?: Record<string, any>; // You can use Record<string, any> if you want better typing

  @ApiProperty({ description: 'Unique username of the user' })
  @IsString()
  userName: string;

  @ApiProperty({
    description: 'Avatar image for the event preference',
    type: 'string',
    format: 'binary',
  })
  profilePic: Express.Multer.File;
}

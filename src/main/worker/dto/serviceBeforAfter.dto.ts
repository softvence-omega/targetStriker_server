import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class ServiceBeforAfterDto {
  @ApiPropertyOptional({
    description: 'Whether this is a preview photo',
    default: false,
    example: false,
  })
  @IsBoolean()
  @Type(() => Boolean)
  isPrev: boolean;

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
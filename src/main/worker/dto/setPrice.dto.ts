import { BadRequestException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, Min } from 'class-validator';
import { IdDto } from 'src/common/dto/id.dto';

export class SetPriceDto extends IdDto {
  @ApiProperty({
    description:
      'The price of the task in cents (to avoid floating point issues)',
    example: 15000,
    minimum: 0,
  })
  @IsInt()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const parsed = parseInt(value, 10);
      if (Number.isNaN(parsed)) {
        throw new BadRequestException('Price must be a valid number');
      }
      return parsed;
    }
    return value;
  })
  @Min(0, { message: 'Price must be a positive integer' })
  price: number;
}

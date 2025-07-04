import { IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { InvoiceStatus } from 'generated/prisma';
import { IdDto } from 'src/common/dto/id.dto';
import { ApiProperty } from '@nestjs/swagger';

export class InvoiceStatusDto extends IdDto {
  @ApiProperty({
    description: 'The status of the invoice',
    enum: InvoiceStatus,
    example: InvoiceStatus.CONFIRMED,
    required: true,
  })
  @IsEnum(InvoiceStatus)
  @Type(() => String)
  status: InvoiceStatus;
}

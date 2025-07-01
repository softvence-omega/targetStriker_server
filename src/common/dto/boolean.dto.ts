import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsOptional } from "class-validator";

export class BooleanDto {
   @ApiPropertyOptional({
       description: 'Whether this is a preview photo',
       default: false,
       example: false,
     })
     @IsBoolean()
     @Type(() => Boolean)
     @IsOptional()
     value?: boolean;
}
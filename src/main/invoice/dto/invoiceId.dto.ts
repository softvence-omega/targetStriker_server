import { IsEnum, IsNumber, IsOptional, IsString, Length, Max, Min } from "class-validator";

export enum IdStrategy {
  SEQUENTIAL = 'sequential',
  UUID = 'uuid',
  TIMESTAMP = 'timestamp'
}

export class GenerateIdDto {
  @IsEnum(IdStrategy)
  strategy: IdStrategy;

  @IsOptional()
  @IsString()
  @Length(1, 10)
  prefix?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(999999)
  startCounter?: number;
}

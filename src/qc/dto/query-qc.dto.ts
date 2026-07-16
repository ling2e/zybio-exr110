import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryQcDto {
  @IsOptional()
  @IsString()
  dateFrom?: string;

  @IsOptional()
  @IsString()
  dateTo?: string;

  @IsOptional()
  @IsString()
  item?: string;

  @IsOptional()
  @IsIn(['L', 'M', 'H'])
  level?: 'L' | 'M' | 'H';

  @IsOptional()
  @IsString()
  lotNo?: string;

  @IsOptional()
  @IsIn(['pass', 'fail', 'pending'])
  status?: 'pass' | 'fail' | 'pending';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}

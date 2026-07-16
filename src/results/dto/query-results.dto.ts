import { IsOptional, IsString, IsIn, IsNumberString } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryResultsDto {
  @IsOptional()
  @IsString()
  dateFrom?: string;

  @IsOptional()
  @IsString()
  dateTo?: string;

  @IsOptional()
  @IsString()
  patient?: string;

  @IsOptional()
  @IsString()
  item?: string;

  @IsOptional()
  @IsString()
  device?: string;

  @IsOptional()
  @IsIn(['reviewed', 'unreviewed'])
  status?: 'reviewed' | 'unreviewed';

  @IsOptional()
  @IsIn(['normal', 'abnormal'])
  flag?: 'normal' | 'abnormal';

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  includeVoided?: boolean;

  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;
}

import { IsString, IsOptional } from 'class-validator';

export class ReviewResultDto {
  @IsString()
  reviewedBy: string;

  @IsOptional()
  @IsString()
  comment?: string;
}

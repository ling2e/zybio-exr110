import { IsDateString } from 'class-validator';

export class DailyStatsQueryDto {
  @IsDateString()
  date: string;
}

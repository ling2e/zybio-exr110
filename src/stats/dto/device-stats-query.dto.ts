import { IsDateString } from 'class-validator';

export class DeviceStatsQueryDto {
  @IsDateString()
  dateFrom: string;

  @IsDateString()
  dateTo: string;
}

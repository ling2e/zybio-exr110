import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { StatsService } from './stats.service';
import { DailyStatsQueryDto } from './dto/daily-stats-query.dto';
import { ThroughputQueryDto } from './dto/throughput-query.dto';
import { DeviceStatsQueryDto } from './dto/device-stats-query.dto';

@ApiTags('Stats')
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('daily')
  getDaily(@Query() query: DailyStatsQueryDto) {
    return this.statsService.getDailyStats(query.date);
  }

  @Get('throughput')
  getThroughput(@Query() query: ThroughputQueryDto) {
    return this.statsService.getThroughput(
      query.dateFrom,
      query.dateTo,
      query.groupBy ?? 'day',
    );
  }

  @Get('devices')
  getDevices(@Query() query: DeviceStatsQueryDto) {
    return this.statsService.getDeviceStats(query.dateFrom, query.dateTo);
  }
}

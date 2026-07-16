import { Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DevicesService } from './devices.service';

@ApiTags('Devices')
@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Get()
  findAll() {
    return this.devicesService.findAll();
  }

  @Post('check-all')
  async checkAll() {
    await this.devicesService.checkAllDevices();
    return this.devicesService.findAll();
  }

  @Post(':id/ping')
  async ping(@Param('id') id: string) {
    return this.devicesService.pingDevice(id);
  }

  @Get(':id/history')
  findHistory(@Param('id') id: string) {
    return this.devicesService.findHistory(id);
  }
}

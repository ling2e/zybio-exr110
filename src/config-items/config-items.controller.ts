import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ConfigItemsService } from './config-items.service';
import { UpdateConfigItemDto } from './dto/update-config-item.dto';

@ApiTags('Config')
@Controller('config')
export class ConfigItemsController {
  constructor(private readonly configItemsService: ConfigItemsService) {}

  @Get('items')
  findAll() {
    return this.configItemsService.findAll();
  }

  @Put('items/:name')
  upsert(
    @Param('name') name: string,
    @Body() dto: UpdateConfigItemDto,
  ) {
    return this.configItemsService.upsert(name, dto);
  }
}

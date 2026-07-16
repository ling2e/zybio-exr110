import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Query,
  ConflictException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { WorkOrdersService } from './work-orders.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { QueryWorkOrderDto } from './dto/query-work-order.dto';

@ApiTags('Work Orders')
@Controller('work-orders')
export class WorkOrdersController {
  constructor(private readonly workOrdersService: WorkOrdersService) {}

  @Post()
  create(@Body() dto: CreateWorkOrderDto) {
    return this.workOrdersService.create(dto);
  }

  @Get()
  findAll(@Query() query: QueryWorkOrderDto) {
    return this.workOrdersService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    const wo = this.workOrdersService.findById(id);
    if (!wo) {
      throw new NotFoundException(`Work order #${id} not found`);
    }
    return wo;
  }

  @Delete(':id')
  cancel(@Param('id', ParseIntPipe) id: number) {
    try {
      return this.workOrdersService.cancel(id);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes('not found')) {
        throw new NotFoundException(message);
      }
      if (message.includes('Cannot cancel')) {
        throw new ConflictException(message);
      }
      throw err;
    }
  }

  @Post('batch')
  batchCreate(@Body() items: CreateWorkOrderDto[]) {
    return this.workOrdersService.batchCreate(items);
  }
}

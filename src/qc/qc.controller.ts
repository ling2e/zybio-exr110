import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { QcService } from './qc.service';
import { QueryQcDto } from './dto/query-qc.dto';

@ApiTags('QC')
@Controller('qc')
export class QcController {
  constructor(private readonly qcService: QcService) {}

  @Get()
  findAll(@Query() query: QueryQcDto) {
    return this.qcService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    const result = this.qcService.findById(id);
    if (!result) {
      throw new NotFoundException(`QC result #${id} not found`);
    }
    return result;
  }
}

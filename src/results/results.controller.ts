import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Query,
  Body,
  Res,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { ResultsService } from './results.service';
import { QueryResultsDto } from './dto/query-results.dto';
import { ReviewResultDto } from './dto/review-result.dto';
import { VoidResultDto } from './dto/void-result.dto';

@ApiTags('Results')
@Controller('results')
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}

  @Get()
  findAll(@Query() query: QueryResultsDto) {
    const page = query.page ? parseInt(query.page, 10) : 1;
    const limit = query.limit ? parseInt(query.limit, 10) : 20;
    return this.resultsService.findAll({
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
      patient: query.patient,
      item: query.item,
      device: query.device,
      status: query.status,
      flag: query.flag,
      includeVoided: query.includeVoided,
      page,
      limit,
    });
  }

  // ponytail: export route MUST be before :id to avoid NestJS treating "export" as an id param
  @Get('export')
  exportCsv(@Query() query: QueryResultsDto, @Res() res: Response) {
    const csv = this.resultsService.exportCsv({
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
      patient: query.patient,
      item: query.item,
      device: query.device,
      status: query.status,
      flag: query.flag,
      includeVoided: query.includeVoided,
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="results.csv"');
    res.send(csv);
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.resultsService.findById(id);
  }

  @Put(':id/review')
  review(@Param('id', ParseIntPipe) id: number, @Body() dto: ReviewResultDto) {
    return this.resultsService.review(id, dto.reviewedBy, dto.comment);
  }

  @Put(':id/unreview')
  unreview(@Param('id', ParseIntPipe) id: number) {
    return this.resultsService.unreview(id);
  }

  @Delete(':id')
  softDelete(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: VoidResultDto,
  ) {
    this.resultsService.softDelete(id, dto.voidedBy, dto.reason);
    return { message: `Result #${id} voided` };
  }
}

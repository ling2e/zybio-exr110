import { forwardRef, Module } from '@nestjs/common';
import { WorkOrdersService } from './work-orders.service';
import { WorkOrdersController } from './work-orders.controller';
import { Hl7Module } from '../hl7/hl7.module';

@Module({
  imports: [forwardRef(() => Hl7Module)],
  controllers: [WorkOrdersController],
  providers: [WorkOrdersService],
  exports: [WorkOrdersService],
})
export class WorkOrdersModule {}

import { forwardRef, Module } from '@nestjs/common';
import { MllpService } from './mllp.service';
import { Hl7ParserService } from './hl7-parser.service';
import { Hl7BuilderService } from './hl7-builder.service';
import { Hl7RouterService } from './hl7-router.service';
import { OruHandlerService } from './oru-handler.service';
import { QryHandlerService } from './qry-handler.service';
import { ResultsModule } from '../results/results.module';
import { QcModule } from '../qc/qc.module';
import { MessagesModule } from '../messages/messages.module';
import { DevicesModule } from '../devices/devices.module';
import { WorkOrdersModule } from '../work-orders/work-orders.module';
import { OrmSenderService } from './orm-sender.service';

@Module({
  imports: [
    ResultsModule,
    QcModule,
    MessagesModule,
    forwardRef(() => DevicesModule),
    forwardRef(() => WorkOrdersModule),
  ],
  providers: [
    MllpService,
    Hl7ParserService,
    Hl7BuilderService,
    Hl7RouterService,
    OruHandlerService,
    QryHandlerService,
    OrmSenderService,
  ],
  exports: [MllpService, Hl7ParserService, Hl7BuilderService, Hl7RouterService, OrmSenderService],
})
export class Hl7Module {}

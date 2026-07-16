import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { ApiKeyGuard } from './common/api-key.guard';
import { DatabaseModule } from './database/database.module';
import { Hl7Module } from './hl7/hl7.module';
import { DevicesModule } from './devices/devices.module';
import { MessagesModule } from './messages/messages.module';
import { QcModule } from './qc/qc.module';
import { ResultsModule } from './results/results.module';
import { WorkOrdersModule } from './work-orders/work-orders.module';
import { StatsModule } from './stats/stats.module';
import { PatientsModule } from './patients/patients.module';
import { ConfigItemsModule } from './config-items/config-items.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    Hl7Module,
    DevicesModule,
    MessagesModule,
    QcModule,
    ResultsModule,
    WorkOrdersModule,
    StatsModule,
    PatientsModule,
    ConfigItemsModule,
  ],
  controllers: [AppController],
  providers: [{ provide: APP_GUARD, useClass: ApiKeyGuard }],
})
export class AppModule {}

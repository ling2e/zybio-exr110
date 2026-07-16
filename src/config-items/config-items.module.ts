import { Module } from '@nestjs/common';
import { ConfigItemsService } from './config-items.service';
import { ConfigItemsController } from './config-items.controller';

@Module({
  controllers: [ConfigItemsController],
  providers: [ConfigItemsService],
  exports: [ConfigItemsService],
})
export class ConfigItemsModule {}

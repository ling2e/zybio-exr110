import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { QueryMessagesDto } from './dto/query-messages.dto';

@ApiTags('Messages')
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  findAll(@Query() query: QueryMessagesDto) {
    return this.messagesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    const message = this.messagesService.findById(id);
    if (!message) {
      throw new NotFoundException(`Message #${id} not found`);
    }
    // ponytail: return raw_hex as hex string for readability in JSON
    return {
      ...message,
      raw_hex: message.raw_hex ? Buffer.from(message.raw_hex).toString('hex') : null,
    };
  }
}

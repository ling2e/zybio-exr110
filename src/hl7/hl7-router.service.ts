import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { MllpService } from './mllp.service';
import { Hl7ParserService } from './hl7-parser.service';
import { Hl7BuilderService } from './hl7-builder.service';
import { Hl7Message, Hl7ParseError } from './hl7.types';
import { MessagesService } from '../messages/messages.service';

/**
 * Handler interface — implemented by domain handlers (OruHandler, QryHandler, etc.).
 * Handlers register themselves into the router via registerHandler().
 */
export interface Hl7MessageHandler {
  handle(message: Hl7Message, deviceId: string): Promise<string | string[]>;
}

/**
 * Routes incoming HL7 messages to registered handlers by MSH-9 message type.
 * Subscribes to MllpService 'frame' events and sends responses back.
 *
 * Error handling:
 *  - Parse failure → ACK with MSA|AE + statusCode from Hl7ParseError
 *  - Unknown message type → ACK with MSA|AR + statusCode 200
 *  - No handler registered for known type → ACK with MSA|AA (log warning)
 *  - Handler throws → ACK with MSA|AE + statusCode 207
 */
@Injectable()
export class Hl7RouterService implements OnModuleInit {
  private readonly logger = new Logger(Hl7RouterService.name);
  private readonly handlers = new Map<string, Hl7MessageHandler>();

  constructor(
    private readonly mllp: MllpService,
    private readonly parser: Hl7ParserService,
    private readonly builder: Hl7BuilderService,
    private readonly messagesService: MessagesService,
  ) {}

  onModuleInit() {
    this.mllp.on('frame', (deviceId: string, raw: string) => {
      // ponytail: fire-and-forget — errors are caught internally, never crash
      void this.processFrame(deviceId, raw);
    });
    this.logger.log('HL7 router subscribed to MLLP frame events');
  }

  /** Register a handler for a specific message type (e.g. 'ORU^R01'). */
  registerHandler(messageType: string, handler: Hl7MessageHandler): void {
    this.handlers.set(messageType, handler);
    this.logger.log(`Handler registered for ${messageType}`);
  }

  /** Main dispatch logic — never throws. */
  async processFrame(deviceId: string, raw: string): Promise<void> {
    let controlId = 'unknown';

    try {
      const message = this.parser.parse(raw);
      controlId = message.msh.controlId || 'unknown';
      const messageType = message.msh.messageType;

      this.logger.debug(
        `Received ${messageType} (ctrl=${controlId}) from ${deviceId}`,
      );

      const handler = this.handlers.get(messageType);

      if (!handler) {
        // ACK^R03 from device is just a final-ack — log and ignore, no response needed
        if (messageType === 'ACK^R03') {
          this.logger.debug(`ACK^R03 received from ${deviceId}, no response needed`);
          return;
        }

        // Unknown/unregistered message type → AR
        this.logger.warn(
          `No handler for message type "${messageType}" from ${deviceId}`,
        );
        // Record unhandled message type — no handler will process it
        this.messagesService.logMessage({
          deviceId,
          direction: 'in',
          rawHex: Buffer.from(raw, 'utf-8'),
          decodedText: raw,
          messageType,
          controlId,
        });
        const ack = this.builder.buildAck(controlId, 'AR', 200);
        this.mllp.sendToDevice(deviceId, ack);
        return;
      }

      // Dispatch to handler
      const response = await handler.handle(message, deviceId);
      const responses = Array.isArray(response) ? response : [response];

      for (const msg of responses) {
        this.mllp.sendToDevice(deviceId, msg);
      }
    } catch (err) {
      if (err instanceof Hl7ParseError) {
        this.logger.error(
          `Parse error from ${deviceId}: ${err.message} (code=${err.statusCode})`,
        );
        // Record unparseable message — handlers won't see it, so router must log it
        this.messagesService.logMessage({
          deviceId,
          direction: 'in',
          rawHex: Buffer.from(raw, 'utf-8'),
          decodedText: raw,
          messageType: 'PARSE_ERROR',
          controlId: undefined,
        });
        const ack = this.builder.buildAck(controlId, 'AE', err.statusCode);
        this.mllp.sendToDevice(deviceId, ack);
      } else {
        // Handler or unexpected error → AE with 207 (application internal error)
        const message = err instanceof Error ? err.message : String(err);
        this.logger.error(
          `Handler error for ${deviceId} (ctrl=${controlId}): ${message}`,
        );
        const ack = this.builder.buildAck(controlId, 'AE', 207);
        this.mllp.sendToDevice(deviceId, ack);
      }
    }
  }
}

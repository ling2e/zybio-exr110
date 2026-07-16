// ponytail: no class-validator here — this DTO is used internally by the service, not exposed via REST
export class CreateMessageDto {
  deviceId?: string;
  direction: 'in' | 'out';
  rawHex?: Buffer;
  decodedText?: string;
  messageType?: string;
  controlId?: string;
}

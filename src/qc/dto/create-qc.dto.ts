export class CreateQcResultDto {
  deviceId?: string;
  solutionName?: string;
  lotNo?: string;
  level?: 'L' | 'M' | 'H';
  serviceId?: string;
  testTime?: string;
  expiryDate?: string;
  messageLogId?: number;
}

export class CreateQcResultItemDto {
  setId!: number;
  itemId?: string;
  itemName?: string;
  targetValue?: number;
  sd?: number;
  measuredValue?: string;
  unit?: string;
  referenceRange?: string;
  flags?: string;
  channelNo?: string;
}

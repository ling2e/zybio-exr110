import { IsString } from 'class-validator';

export class VoidResultDto {
  @IsString()
  reason: string;

  @IsString()
  voidedBy: string;
}

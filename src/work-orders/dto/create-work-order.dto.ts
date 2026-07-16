import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateWorkOrderDto {
  @IsNotEmpty()
  @IsString()
  barcode: string;

  @IsOptional()
  @IsString()
  patientName?: string;

  @IsOptional()
  @IsString()
  sex?: string;

  @IsOptional()
  @IsNumber()
  age?: number;

  @IsOptional()
  @IsString()
  ageUnit?: string;

  @IsNotEmpty()
  @IsString()
  sampleType: string;

  @IsArray()
  @IsString({ each: true })
  items: string[];

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  patientNo?: string;

  @IsOptional()
  @IsString()
  admissionNo?: string;

  @IsOptional()
  @IsString()
  submitter?: string;

  @IsOptional()
  @IsString()
  reviewer?: string;

  @IsOptional()
  @IsString()
  diagnosis?: string;

  @IsOptional()
  @IsString()
  samplingTime?: string;

  @IsOptional()
  @IsString()
  submissionTime?: string;

  @IsOptional()
  @IsBoolean()
  pushToDevice?: boolean;

  @IsOptional()
  @IsString()
  targetDeviceId?: string;
}

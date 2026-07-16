export interface WorkOrder {
  id: number;
  barcode: string;
  patient_id?: number;
  patient_name?: string;
  sex?: string;
  age?: number;
  age_unit?: string;
  sample_type: string;
  items: string;
  department?: string;
  patient_no?: string;
  admission_no?: string;
  submitter?: string;
  reviewer?: string;
  diagnosis?: string;
  sampling_time?: string;
  submission_time?: string;
  status: string;
  target_device_id?: string;
  push_status?: string;
  pushed_at?: string;
  completed_at?: string;
  expired_at?: string;
  created_at: string;
  updated_at: string;
}

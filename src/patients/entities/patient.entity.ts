export interface Patient {
  id: number;
  name: string;
  sex: string | null;
  date_of_birth: string | null;
  medical_record_no: string | null;
  department: string | null;
  admission_no: string | null;
  blood_type: string | null;
  pregnant: string | null;
  created_at: string;
  updated_at: string;
}

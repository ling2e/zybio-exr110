export interface MessageLog {
  id: number;
  device_id: string | null;
  direction: 'in' | 'out';
  raw_hex: Buffer | null;
  decoded_text: string | null;
  message_type: string | null;
  control_id: string | null;
  created_at: string;
}

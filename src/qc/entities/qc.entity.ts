export interface QcResult {
  id: number;
  device_id: string | null;
  solution_name: string | null;
  lot_no: string | null;
  level: 'L' | 'M' | 'H' | null;
  service_id: string | null;
  test_time: string | null;
  expiry_date: string | null;
  status: string;
  created_at: string;
}

export interface QcResultItem {
  id: number;
  qc_result_id: number;
  set_id: number;
  item_id: string | null;
  item_name: string | null;
  target_value: number | null;
  sd: number | null;
  measured_value: string | null;
  unit: string | null;
  reference_range: string | null;
  flags: string | null;
  channel_no: string | null;
}

export interface QcResultWithItems extends QcResult {
  items: QcResultItem[];
}

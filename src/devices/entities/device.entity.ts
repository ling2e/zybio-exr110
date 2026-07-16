export interface Device {
  id: string;
  ip_address: string;
  port: number;
  model: string | null;
  software_version: string | null;
  status: string;
  first_seen_at: string;
  last_seen_at: string | null;
  last_message_at: string | null;
}

export interface DeviceEvent {
  id: number;
  device_id: string;
  event_type: string;
  detail: string | null;
  created_at: string;
}

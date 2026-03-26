import { apiGet, apiPost, apiPut, apiDelete } from '../utils/fetchInterceptor';

export interface Alarm {
  id: number;
  deviceId: string;
  name: string;
  triggerTime: string;
  triggerTimeStr: string;
  hour: number;
  minute: number;
  repeatCount: number;
  interval: number;
  enabled: boolean;
  type: number;
  typeStr: 'countdown' | 'scheduled' | 'repeating';
  syncStatus: 'synced' | 'pending' | 'conflict';
}

export interface CreateAlarmRequest {
  name: string;
  delay?: number;
  hour?: number;
  minute?: number;
  repeat?: number;
  interval?: number;
}

export interface UpdateAlarmRequest {
  name?: string;
  hour?: number;
  minute?: number;
  repeat?: number;
  interval?: number;
  enabled?: boolean;
}

export const getAlarms = async (): Promise<Alarm[]> => {
  const response = await apiGet<{ success: boolean; data: Alarm[] }>('/alarms');
  return response.data || [];
};

export const getDeviceAlarms = async (deviceId: string): Promise<Alarm[]> => {
  const response = await apiGet<{ success: boolean; data: Alarm[] }>(
    `/devices/${deviceId}/alarms`,
  );
  return response.data || [];
};

export const getAlarm = async (deviceId: string, alarmId: number): Promise<Alarm> => {
  const response = await apiGet<{ success: boolean; data: Alarm }>(
    `/devices/${deviceId}/alarms/${alarmId}`,
  );
  return response.data;
};

export const createAlarm = async (
  deviceId: string,
  data: CreateAlarmRequest,
): Promise<Alarm> => {
  const response = await apiPost<{ success: boolean; data: Alarm }>(
    `/devices/${deviceId}/alarms`,
    data,
  );
  return response.data;
};

export const updateAlarm = async (
  deviceId: string,
  alarmId: number,
  data: UpdateAlarmRequest,
): Promise<Alarm> => {
  const response = await apiPut<{ success: boolean; data: Alarm }>(
    `/devices/${deviceId}/alarms/${alarmId}`,
    data,
  );
  return response.data;
};

export const deleteAlarm = async (deviceId: string, alarmId: number): Promise<void> => {
  await apiDelete(`/devices/${deviceId}/alarms/${alarmId}`);
};

export const clearDeviceAlarms = async (deviceId: string): Promise<{ count: number }> => {
  const response = await apiDelete<{ success: boolean; data: { count: number } }>(
    `/devices/${deviceId}/alarms`,
  );
  return response.data;
};

export const syncDeviceAlarms = async (deviceId: string): Promise<void> => {
  await apiPost(`/devices/${deviceId}/alarms/sync`, {});
};

export const getUpcomingAlarms = async (
  deviceId: string,
  limit: number = 10,
): Promise<Alarm[]> => {
  const response = await apiGet<{ success: boolean; data: Alarm[] }>(
    `/devices/${deviceId}/alarms/upcoming?limit=${limit}`,
  );
  return response.data || [];
};

export const getAlarmTypeLabel = (typeStr: string): string => {
  switch (typeStr) {
    case 'scheduled':
      return '定时闹钟';
    case 'repeating':
      return '重复闹钟';
    case 'countdown':
      return '倒计时';
    default:
      return '未知类型';
  }
};

export const getRepeatLabel = (repeatCount: number, interval: number): string => {
  if (repeatCount === -1) {
    if (interval === 86400) return '每天重复';
    if (interval === 604800) return '每周重复';
    return `每 ${Math.floor(interval / 3600)} 小时重复`;
  }
  if (repeatCount === 1) return '单次';
  return `重复 ${repeatCount} 次`;
};

import { apiGet, apiPost, apiPut, apiDelete } from '../utils/fetchInterceptor';

export interface Device {
  id: string;
  name: string;
  userId?: string;
  endpointId?: string;
  lastSync?: string;
  status: 'online' | 'offline';
  metadata?: {
    macAddress?: string;
    firmwareVersion?: string;
    hardwareVersion?: string;
    ipAddress?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DeviceWithAlarmCount {
  device: Device;
  alarmCount: number;
}

export interface CreateDeviceRequest {
  id: string;
  name: string;
  userId?: string;
  endpointId?: string;
  metadata?: Device['metadata'];
}

export interface UpdateDeviceRequest {
  name?: string;
  userId?: string;
  endpointId?: string;
  metadata?: Partial<Device['metadata']>;
  status?: string;
}

export const getDevices = async (): Promise<Device[]> => {
  const response = await apiGet<{ success: boolean; data: Device[] }>('/devices');
  if (response && response.data) {
    return response.data;
  }
  if (Array.isArray(response)) {
    return response;
  }
  return [];
};

export const getDevicesWithAlarmCount = async (): Promise<DeviceWithAlarmCount[]> => {
  const response = await apiGet<{ success: boolean; data: DeviceWithAlarmCount[] }>(
    '/devices/with-alarm-count',
  );
  return response.data || [];
};

export const getDevice = async (deviceId: string): Promise<Device> => {
  const response = await apiGet<{ success: boolean; data: Device }>(`/devices/${deviceId}`);
  return response.data;
};

export const createDevice = async (data: CreateDeviceRequest): Promise<Device> => {
  const response = await apiPost<{ success: boolean; data: Device }>('/devices', data);
  if (response && response.data) {
    return response.data;
  }
  return response as unknown as Device;
};

export const updateDevice = async (
  deviceId: string,
  data: UpdateDeviceRequest,
): Promise<Device> => {
  const response = await apiPut<{ success: boolean; data: Device }>(`/devices/${deviceId}`, data);
  return response.data;
};

export const deleteDevice = async (deviceId: string): Promise<void> => {
  await apiDelete(`/devices/${deviceId}`);
};

export const registerDevice = async (data: CreateDeviceRequest): Promise<Device> => {
  const response = await apiPost<{ success: boolean; data: Device }>('/devices/register', data);
  return response.data;
};

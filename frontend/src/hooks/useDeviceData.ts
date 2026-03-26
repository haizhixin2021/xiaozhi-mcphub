import { useState, useEffect, useCallback } from 'react';
import {
  getDevices,
  getDevicesWithAlarmCount,
  getDevice,
  createDevice,
  updateDevice,
  deleteDevice,
  Device,
  DeviceWithAlarmCount,
  CreateDeviceRequest,
  UpdateDeviceRequest,
} from '../services/deviceService';

export const useDevices = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDevices = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getDevices();
      setDevices(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch devices');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  return { devices, loading, error, refetch: fetchDevices };
};

export const useDevicesWithAlarmCount = () => {
  const [devices, setDevices] = useState<DeviceWithAlarmCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDevices = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getDevicesWithAlarmCount();
      setDevices(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch devices');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  return { devices, loading, error, refetch: fetchDevices };
};

export const useDevice = (deviceId: string) => {
  const [device, setDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDevice = useCallback(async () => {
    if (!deviceId) return;
    try {
      setLoading(true);
      const data = await getDevice(deviceId);
      setDevice(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch device');
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  useEffect(() => {
    fetchDevice();
  }, [fetchDevice]);

  return { device, loading, error, refetch: fetchDevice };
};

export const useDeviceActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (data: CreateDeviceRequest): Promise<Device | null> => {
    try {
      setLoading(true);
      setError(null);
      return await createDevice(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create device');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(
    async (deviceId: string, data: UpdateDeviceRequest): Promise<Device | null> => {
      try {
        setLoading(true);
        setError(null);
        return await updateDevice(deviceId, data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update device');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const remove = useCallback(async (deviceId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await deleteDevice(deviceId);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete device');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { create, update, remove, loading, error };
};

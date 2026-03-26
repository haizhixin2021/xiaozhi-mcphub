import { useState, useEffect, useCallback } from 'react';
import {
  getAlarms,
  getDeviceAlarms,
  getAlarm,
  createAlarm,
  updateAlarm,
  deleteAlarm,
  clearDeviceAlarms,
  syncDeviceAlarms,
  getUpcomingAlarms,
  Alarm,
  CreateAlarmRequest,
  UpdateAlarmRequest,
} from '../services/alarmService';

export const useAlarms = () => {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlarms = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAlarms();
      setAlarms(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch alarms');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlarms();
  }, [fetchAlarms]);

  return { alarms, loading, error, refetch: fetchAlarms };
};

export const useDeviceAlarms = (deviceId: string) => {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlarms = useCallback(async () => {
    if (!deviceId) return;
    try {
      setLoading(true);
      const data = await getDeviceAlarms(deviceId);
      setAlarms(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch alarms');
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  useEffect(() => {
    fetchAlarms();
  }, [fetchAlarms]);

  return { alarms, loading, error, refetch: fetchAlarms };
};

export const useUpcomingAlarms = (deviceId: string, limit: number = 10) => {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlarms = useCallback(async () => {
    if (!deviceId) return;
    try {
      setLoading(true);
      const data = await getUpcomingAlarms(deviceId, limit);
      setAlarms(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch upcoming alarms');
    } finally {
      setLoading(false);
    }
  }, [deviceId, limit]);

  useEffect(() => {
    fetchAlarms();
  }, [fetchAlarms]);

  return { alarms, loading, error, refetch: fetchAlarms };
};

export const useAlarmActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(
    async (deviceId: string, data: CreateAlarmRequest): Promise<Alarm | null> => {
      try {
        setLoading(true);
        setError(null);
        return await createAlarm(deviceId, data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create alarm');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const update = useCallback(
    async (deviceId: string, alarmId: number, data: UpdateAlarmRequest): Promise<Alarm | null> => {
      try {
        setLoading(true);
        setError(null);
        return await updateAlarm(deviceId, alarmId, data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update alarm');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const remove = useCallback(
    async (deviceId: string, alarmId: number): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);
        await deleteAlarm(deviceId, alarmId);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete alarm');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const clearAll = useCallback(async (deviceId: string): Promise<number | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await clearDeviceAlarms(deviceId);
      return result.count;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear alarms');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const sync = useCallback(async (deviceId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await syncDeviceAlarms(deviceId);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync alarms');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { create, update, remove, clearAll, sync, loading, error };
};

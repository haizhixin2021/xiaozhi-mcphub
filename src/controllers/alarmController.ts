import { Request, Response } from 'express';
import { alarmService } from '../services/alarmService.js';
import { alarmSyncService } from '../services/alarmSyncService.js';
import { deviceService } from '../services/deviceService.js';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export const getAlarms = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const alarms = await alarmService.getAllAlarmsByUserId(user.username);

    res.json({
      success: true,
      data: alarms.map((alarm) => alarm.toJSON()),
    } as ApiResponse);
  } catch (error) {
    console.error('Error getting alarms:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get alarms',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ApiResponse);
  }
};

export const getDeviceAlarms = async (req: Request, res: Response): Promise<void> => {
  try {
    const { deviceId } = req.params;
    const alarms = await alarmService.getAlarmsByDeviceId(deviceId);

    res.json({
      success: true,
      data: alarms.map((alarm) => alarm.toJSON()),
    } as ApiResponse);
  } catch (error) {
    console.error('Error getting device alarms:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get device alarms',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ApiResponse);
  }
};

export const getAlarm = async (req: Request, res: Response): Promise<void> => {
  try {
    const { deviceId, alarmId } = req.params;
    const alarm = await alarmService.getAlarmById(deviceId, parseInt(alarmId));

    if (!alarm) {
      res.status(404).json({
        success: false,
        message: 'Alarm not found',
      } as ApiResponse);
      return;
    }

    res.json({
      success: true,
      data: alarm.toJSON(),
    } as ApiResponse);
  } catch (error) {
    console.error('Error getting alarm:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get alarm',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ApiResponse);
  }
};

export const createAlarm = async (req: Request, res: Response): Promise<void> => {
  try {
    const { deviceId } = req.params;
    const { name, delay, hour, minute, repeat, interval } = req.body;

    if (!name) {
      res.status(400).json({
        success: false,
        message: 'Alarm name is required',
      } as ApiResponse);
      return;
    }

    const device = await deviceService.getDeviceById(deviceId);
    if (!device) {
      res.status(404).json({
        success: false,
        message: 'Device not found',
      } as ApiResponse);
      return;
    }

    const alarm = await alarmService.createAlarm({
      deviceId,
      name,
      delay,
      hour,
      minute,
      repeat,
      interval,
    });

    if (device.status === 'online') {
      await alarmSyncService.pushAlarmToDevice(deviceId, alarm);
    }

    res.status(201).json({
      success: true,
      data: alarm.toJSON(),
      message: 'Alarm created successfully',
    } as ApiResponse);
  } catch (error) {
    console.error('Error creating alarm:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create alarm',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ApiResponse);
  }
};

export const updateAlarm = async (req: Request, res: Response): Promise<void> => {
  try {
    const { deviceId, alarmId } = req.params;
    const { name, hour, minute, repeat, interval, enabled } = req.body;

    const alarm = await alarmService.updateAlarm(deviceId, parseInt(alarmId), {
      name,
      hour,
      minute,
      repeat,
      interval,
      enabled,
    });

    const device = await deviceService.getDeviceById(deviceId);
    if (device && device.status === 'online') {
      await alarmSyncService.pushAlarmUpdateToDevice(deviceId, alarm);
    }

    res.json({
      success: true,
      data: alarm.toJSON(),
      message: 'Alarm updated successfully',
    } as ApiResponse);
  } catch (error) {
    console.error('Error updating alarm:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update alarm',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ApiResponse);
  }
};

export const deleteAlarm = async (req: Request, res: Response): Promise<void> => {
  try {
    const { deviceId, alarmId } = req.params;
    const alarmIdNum = parseInt(alarmId);

    const device = await deviceService.getDeviceById(deviceId);
    const deleted = await alarmService.deleteAlarm(deviceId, alarmIdNum);

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: 'Alarm not found',
      } as ApiResponse);
      return;
    }

    if (device && device.status === 'online') {
      await alarmSyncService.pushAlarmDeleteToDevice(deviceId, alarmIdNum);
    }

    res.json({
      success: true,
      message: 'Alarm deleted successfully',
    } as ApiResponse);
  } catch (error) {
    console.error('Error deleting alarm:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete alarm',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ApiResponse);
  }
};

export const clearDeviceAlarms = async (req: Request, res: Response): Promise<void> => {
  try {
    const { deviceId } = req.params;

    const device = await deviceService.getDeviceById(deviceId);
    const count = await alarmService.clearAllAlarms(deviceId);

    if (device && device.status === 'online') {
      await alarmSyncService.pushClearAlarmsToDevice(deviceId);
    }

    res.json({
      success: true,
      message: `Cleared ${count} alarms`,
      data: { count },
    } as ApiResponse);
  } catch (error) {
    console.error('Error clearing alarms:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear alarms',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ApiResponse);
  }
};

export const syncDeviceAlarms = async (req: Request, res: Response): Promise<void> => {
  try {
    const { deviceId } = req.params;

    const device = await deviceService.getDeviceById(deviceId);
    if (!device) {
      res.status(404).json({
        success: false,
        message: 'Device not found',
      } as ApiResponse);
      return;
    }

    if (device.status !== 'online') {
      res.status(400).json({
        success: false,
        message: 'Device is offline',
      } as ApiResponse);
      return;
    }

    const syncMessage = await alarmSyncService.syncDeviceAlarms(deviceId);

    res.json({
      success: true,
      message: 'Sync initiated',
      data: syncMessage,
    } as ApiResponse);
  } catch (error) {
    console.error('Error syncing alarms:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync alarms',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ApiResponse);
  }
};

export const getUpcomingAlarms = async (req: Request, res: Response): Promise<void> => {
  try {
    const { deviceId } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;

    const alarms = await alarmService.getUpcomingAlarms(deviceId, limit);

    res.json({
      success: true,
      data: alarms.map((alarm) => alarm.toJSON()),
    } as ApiResponse);
  } catch (error) {
    console.error('Error getting upcoming alarms:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get upcoming alarms',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ApiResponse);
  }
};

export const handleAlarmReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { deviceId } = req.params;
    const { alarms } = req.body;

    if (!Array.isArray(alarms)) {
      res.status(400).json({
        success: false,
        message: 'Alarms must be an array',
      } as ApiResponse);
      return;
    }

    let device = await deviceService.getDeviceById(deviceId);
    if (!device) {
      device = await deviceService.createDevice({
        id: deviceId,
        name: `Device ${deviceId}`,
      });
      console.log(`Auto-created device: ${deviceId}`);
    }

    await deviceService.updateDeviceStatus(deviceId, 'online');

    const syncMessage = await alarmSyncService.handleAlarmReport({
      type: 'alarm_report',
      deviceId,
      version: 1,
      timestamp: Date.now(),
      alarms,
    });

    res.json({
      success: true,
      message: 'Alarms synced from device',
      data: syncMessage,
    } as ApiResponse);
  } catch (error) {
    console.error('Error handling alarm report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to handle alarm report',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ApiResponse);
  }
};

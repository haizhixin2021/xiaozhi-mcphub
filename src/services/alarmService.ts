import { getDeviceAlarmRepository } from '../db/repositories/DeviceAlarmRepository.js';
import { getDeviceRepository } from '../db/repositories/DeviceRepository.js';
import { DeviceAlarm, AlarmType, SyncStatus } from '../db/entities/DeviceAlarm.js';

export interface CreateAlarmParams {
  deviceId: string;
  name: string;
  delay?: number;
  hour?: number;
  minute?: number;
  repeat?: number;
  interval?: number;
}

export interface UpdateAlarmParams {
  name?: string;
  hour?: number;
  minute?: number;
  repeat?: number;
  interval?: number;
  enabled?: boolean;
}

export interface AlarmFromDevice {
  id: number;
  name: string;
  trigger_time: number;
  hour: number;
  minute: number;
  repeat_count: number;
  interval: number;
  enabled: boolean;
  type: number;
}

class AlarmService {
  async getAlarmsByDeviceId(deviceId: string): Promise<DeviceAlarm[]> {
    const repo = getDeviceAlarmRepository();
    return repo.findByDeviceId(deviceId);
  }

  async getAlarmById(deviceId: string, alarmId: number): Promise<DeviceAlarm | null> {
    const repo = getDeviceAlarmRepository();
    return repo.findByDeviceIdAndAlarmId(deviceId, alarmId);
  }

  async getAllAlarmsByUserId(userId: string): Promise<DeviceAlarm[]> {
    const deviceRepo = getDeviceRepository();
    const devices = await deviceRepo.findByUserId(userId);
    
    const alarmRepo = getDeviceAlarmRepository();
    const allAlarms: DeviceAlarm[] = [];
    
    for (const device of devices) {
      const alarms = await alarmRepo.findByDeviceId(device.id);
      allAlarms.push(...alarms);
    }
    
    return allAlarms;
  }

  async createAlarm(params: CreateAlarmParams): Promise<DeviceAlarm> {
    const deviceRepo = getDeviceRepository();
    const device = await deviceRepo.findById(params.deviceId);
    if (!device) {
      throw new Error(`Device with ID ${params.deviceId} not found`);
    }

    const alarmRepo = getDeviceAlarmRepository();
    const nextId = await alarmRepo.getNextAlarmId(params.deviceId);

    const now = new Date();
    let triggerTime: Date;
    let type: AlarmType;
    let hour = params.hour ?? -1;
    let minute = params.minute ?? -1;

    if (hour >= 0 && hour < 24 && minute >= 0 && minute < 60) {
      type = params.repeat && params.repeat !== 1 ? AlarmType.REPEATING : AlarmType.SCHEDULED;
      
      const targetTime = new Date(now);
      targetTime.setHours(hour, minute, 0, 0);
      
      if (targetTime.getTime() <= now.getTime()) {
        targetTime.setDate(targetTime.getDate() + 1);
      }
      
      triggerTime = targetTime;
    } else {
      type = params.repeat && params.repeat !== 1 ? AlarmType.REPEATING : AlarmType.COUNTDOWN;
      const delay = params.delay || 60;
      triggerTime = new Date(now.getTime() + delay * 1000);
      hour = -1;
      minute = -1;
    }

    const alarmData: Partial<DeviceAlarm> = {
      id: nextId,
      deviceId: params.deviceId,
      name: params.name,
      triggerTime,
      hour,
      minute,
      repeatCount: params.repeat === -1 ? -1 : (params.repeat || 1),
      interval: params.interval || 86400,
      enabled: true,
      type,
      syncStatus: SyncStatus.PENDING,
      deviceCreatedAt: now,
    };

    const savedAlarm = await alarmRepo.save(alarmData);
    
    const savedEntity = await alarmRepo.findByDeviceIdAndAlarmId(params.deviceId, savedAlarm.id);
    if (!savedEntity) {
      throw new Error('Failed to retrieve saved alarm');
    }
    
    return savedEntity;
  }

  async updateAlarm(
    deviceId: string,
    alarmId: number,
    params: UpdateAlarmParams,
  ): Promise<DeviceAlarm> {
    const alarmRepo = getDeviceAlarmRepository();
    const alarm = await alarmRepo.findByDeviceIdAndAlarmId(deviceId, alarmId);
    
    if (!alarm) {
      throw new Error(`Alarm with ID ${alarmId} not found for device ${deviceId}`);
    }

    const now = new Date();
    
    if (params.name !== undefined) {
      alarm.name = params.name;
    }

    if (params.hour !== undefined && params.minute !== undefined) {
      if (params.hour >= 0 && params.hour < 24 && params.minute >= 0 && params.minute < 60) {
        alarm.hour = params.hour;
        alarm.minute = params.minute;
        
        const targetTime = new Date(now);
        targetTime.setHours(params.hour, params.minute, 0, 0);
        
        if (targetTime.getTime() <= now.getTime()) {
          targetTime.setDate(targetTime.getDate() + 1);
        }
        
        alarm.triggerTime = targetTime;
      }
    }

    if (params.repeat !== undefined) {
      alarm.repeatCount = params.repeat === -1 ? -1 : params.repeat;
    }

    if (params.interval !== undefined) {
      alarm.interval = params.interval;
    }

    if (params.enabled !== undefined) {
      alarm.enabled = params.enabled;
    }

    if (alarm.repeatCount === -1 || alarm.repeatCount > 1) {
      alarm.type = AlarmType.REPEATING;
    } else if (alarm.hour >= 0) {
      alarm.type = AlarmType.SCHEDULED;
    } else {
      alarm.type = AlarmType.COUNTDOWN;
    }

    alarm.syncStatus = SyncStatus.PENDING;

    await alarmRepo.save(alarm);
    
    const savedEntity = await alarmRepo.findByDeviceIdAndAlarmId(deviceId, alarmId);
    if (!savedEntity) {
      throw new Error('Failed to retrieve saved alarm');
    }
    
    return savedEntity;
  }

  async deleteAlarm(deviceId: string, alarmId: number): Promise<boolean> {
    const alarmRepo = getDeviceAlarmRepository();
    return alarmRepo.deleteByDeviceIdAndAlarmId(deviceId, alarmId);
  }

  async clearAllAlarms(deviceId: string): Promise<number> {
    const alarmRepo = getDeviceAlarmRepository();
    return alarmRepo.deleteByDeviceId(deviceId);
  }

  async getUpcomingAlarms(deviceId: string, limit: number = 10): Promise<DeviceAlarm[]> {
    const alarmRepo = getDeviceAlarmRepository();
    return alarmRepo.findUpcoming(deviceId, limit);
  }

  async getAlarmCount(deviceId: string): Promise<number> {
    const alarmRepo = getDeviceAlarmRepository();
    return alarmRepo.countByDeviceId(deviceId);
  }

  async syncAlarmsFromDevice(
    deviceId: string,
    deviceAlarms: AlarmFromDevice[],
  ): Promise<DeviceAlarm[]> {
    const alarmRepo = getDeviceAlarmRepository();

    // 如果设备上报空数组，保留云端闹钟
    if (deviceAlarms.length === 0) {
      console.log(`Device ${deviceId} reported no alarms, keeping cloud alarms`);
      return alarmRepo.findByDeviceId(deviceId);
    }
    
    await alarmRepo.deleteByDeviceId(deviceId);
    
    const alarms: Partial<DeviceAlarm>[] = deviceAlarms.map((da) => ({
      id: da.id,
      deviceId,
      name: da.name,
      triggerTime: new Date(da.trigger_time * 1000),
      hour: da.hour,
      minute: da.minute,
      repeatCount: da.repeat_count,
      interval: da.interval,
      enabled: da.enabled,
      type: da.type as AlarmType,
      syncStatus: SyncStatus.SYNCED,
      deviceCreatedAt: new Date(da.trigger_time * 1000),
    }));

    return alarmRepo.bulkSave(alarms);
  }

  async markAlarmsSynced(deviceId: string): Promise<number> {
    const alarmRepo = getDeviceAlarmRepository();
    return alarmRepo.updateAllSyncStatus(deviceId, SyncStatus.SYNCED);
  }

  async getAlarmsForDeviceSync(deviceId: string): Promise<DeviceAlarm[]> {
    const alarmRepo = getDeviceAlarmRepository();
    return alarmRepo.findBySyncStatus(deviceId, SyncStatus.PENDING);
  }

  formatAlarmForDevice(alarm: DeviceAlarm): AlarmFromDevice {
    return {
      id: alarm.id,
      name: alarm.name,
      trigger_time: Math.floor(alarm.triggerTime.getTime() / 1000),
      hour: alarm.hour,
      minute: alarm.minute,
      repeat_count: alarm.repeatCount,
      interval: alarm.interval,
      enabled: alarm.enabled,
      type: alarm.type,
    };
  }

  formatAlarmsForDevice(alarms: DeviceAlarm[]): AlarmFromDevice[] {
    return alarms.map((alarm) => this.formatAlarmForDevice(alarm));
  }
}

export const alarmService = new AlarmService();
export default alarmService;

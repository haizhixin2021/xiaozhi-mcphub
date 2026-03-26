import { EventEmitter } from 'events';
import { alarmService, AlarmFromDevice } from './alarmService.js';
import { deviceService } from './deviceService.js';
import { DeviceAlarm, SyncStatus } from '../db/entities/DeviceAlarm.js';
import { getDeviceAlarmRepository } from '../db/repositories/DeviceAlarmRepository.js';

export interface SyncMessage {
  type: 'alarm_sync';
  version: number;
  timestamp: number;
  action: 'full_sync' | 'add' | 'update' | 'delete' | 'clear';
  alarms?: AlarmFromDevice[];
  alarmId?: number;
}

export interface AlarmReport {
  type: 'alarm_report';
  deviceId: string;
  version: number;
  timestamp: number;
  alarms: AlarmFromDevice[];
}

export interface SyncStrategy {
  onDeviceConnect: boolean;
  onDeviceReconnect: boolean;
  onCloudChange: boolean;
  periodic: number;
  conflictResolution: 'cloud_wins' | 'device_wins' | 'latest_wins';
}

const DEFAULT_SYNC_STRATEGY: SyncStrategy = {
  onDeviceConnect: true,
  onDeviceReconnect: true,
  onCloudChange: true,
  periodic: 300000,
  conflictResolution: 'latest_wins',
};

class AlarmSyncService extends EventEmitter {
  private syncVersion: number = 0;
  private strategy: SyncStrategy = DEFAULT_SYNC_STRATEGY;
  private pendingSyncs: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    super();
  }

  setStrategy(strategy: Partial<SyncStrategy>): void {
    this.strategy = { ...this.strategy, ...strategy };
  }

  getStrategy(): SyncStrategy {
    return { ...this.strategy };
  }

  async handleDeviceConnect(deviceId: string): Promise<void> {
    if (!this.strategy.onDeviceConnect) return;

    await deviceService.updateDeviceStatus(deviceId, 'online');
    this.emit('device_connected', { deviceId });
  }

  async handleDeviceDisconnect(deviceId: string): Promise<void> {
    await deviceService.updateDeviceStatus(deviceId, 'offline');
    this.emit('device_disconnected', { deviceId });
  }

  async handleAlarmReport(report: AlarmReport): Promise<SyncMessage> {
    const { deviceId, alarms } = report;

    console.log(`Received alarm report from device ${deviceId}: ${alarms.length} alarms`);

    await alarmService.syncAlarmsFromDevice(deviceId, alarms);
    await deviceService.updateLastSync(deviceId);

    const cloudAlarms = await alarmService.getAlarmsByDeviceId(deviceId);
    
    this.syncVersion++;
    
    return {
      type: 'alarm_sync',
      version: this.syncVersion,
      timestamp: Date.now(),
      action: 'full_sync',
      alarms: alarmService.formatAlarmsForDevice(cloudAlarms),
    };
  }

  async pushAlarmToDevice(deviceId: string, alarm: DeviceAlarm): Promise<SyncMessage> {
    this.syncVersion++;

    const message: SyncMessage = {
      type: 'alarm_sync',
      version: this.syncVersion,
      timestamp: Date.now(),
      action: 'add',
      alarms: [alarmService.formatAlarmForDevice(alarm)],
    };

    this.emit('alarm_push', { deviceId, message });
    
    return message;
  }

  async pushAlarmUpdateToDevice(
    deviceId: string,
    alarm: DeviceAlarm,
  ): Promise<SyncMessage> {
    this.syncVersion++;

    const message: SyncMessage = {
      type: 'alarm_sync',
      version: this.syncVersion,
      timestamp: Date.now(),
      action: 'update',
      alarms: [alarmService.formatAlarmForDevice(alarm)],
    };

    this.emit('alarm_push', { deviceId, message });
    
    return message;
  }

  async pushAlarmDeleteToDevice(
    deviceId: string,
    alarmId: number,
  ): Promise<SyncMessage> {
    this.syncVersion++;

    const message: SyncMessage = {
      type: 'alarm_sync',
      version: this.syncVersion,
      timestamp: Date.now(),
      action: 'delete',
      alarmId,
    };

    this.emit('alarm_push', { deviceId, message });
    
    return message;
  }

  async pushClearAlarmsToDevice(deviceId: string): Promise<SyncMessage> {
    this.syncVersion++;

    const message: SyncMessage = {
      type: 'alarm_sync',
      version: this.syncVersion,
      timestamp: Date.now(),
      action: 'clear',
    };

    this.emit('alarm_push', { deviceId, message });
    
    return message;
  }

  async syncDeviceAlarms(deviceId: string): Promise<SyncMessage | null> {
    const pendingAlarms = await alarmService.getAlarmsForDeviceSync(deviceId);
    
    if (pendingAlarms.length === 0) {
      return null;
    }

    this.syncVersion++;

    const message: SyncMessage = {
      type: 'alarm_sync',
      version: this.syncVersion,
      timestamp: Date.now(),
      action: 'full_sync',
      alarms: alarmService.formatAlarmsForDevice(
        await alarmService.getAlarmsByDeviceId(deviceId)
      ),
    };

    await alarmService.markAlarmsSynced(deviceId);
    await deviceService.updateLastSync(deviceId);

    this.emit('alarm_sync', { deviceId, message });
    
    return message;
  }

  async handleAlarmTriggered(
    deviceId: string,
    alarmId: number,
  ): Promise<void> {
    this.emit('alarm_triggered', { deviceId, alarmId });
    
    const alarm = await alarmService.getAlarmById(deviceId, alarmId);
    if (alarm) {
      if (alarm.repeatCount === -1) {
        const newTriggerTime = new Date(
          alarm.triggerTime.getTime() + alarm.interval * 1000
        );
        alarm.triggerTime = newTriggerTime;
        const alarmRepo = getDeviceAlarmRepository();
        await alarmRepo.save(alarm);
      } else if (alarm.repeatCount > 1) {
        alarm.repeatCount--;
        const newTriggerTime = new Date(
          alarm.triggerTime.getTime() + alarm.interval * 1000
        );
        alarm.triggerTime = newTriggerTime;
        const alarmRepo = getDeviceAlarmRepository();
        await alarmRepo.save(alarm);
      } else {
        await alarmService.deleteAlarm(deviceId, alarmId);
      }
    }
  }

  scheduleSync(deviceId: string, delay: number = 5000): void {
    if (this.pendingSyncs.has(deviceId)) {
      clearTimeout(this.pendingSyncs.get(deviceId)!);
    }

    const timeout = setTimeout(async () => {
      this.pendingSyncs.delete(deviceId);
      await this.syncDeviceAlarms(deviceId);
    }, delay);

    this.pendingSyncs.set(deviceId, timeout);
  }

  cancelScheduledSync(deviceId: string): void {
    if (this.pendingSyncs.has(deviceId)) {
      clearTimeout(this.pendingSyncs.get(deviceId)!);
      this.pendingSyncs.delete(deviceId);
    }
  }

  getSyncVersion(): number {
    return this.syncVersion;
  }
}

export const alarmSyncService = new AlarmSyncService();
export default alarmSyncService;

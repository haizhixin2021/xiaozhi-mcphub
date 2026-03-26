import { BaseRepository } from './BaseRepository.js';
import { DeviceAlarm, AlarmType, SyncStatus } from '../entities/DeviceAlarm.js';
import { getAppDataSource } from '../connection.js';
import { Repository, In, Between, MoreThan } from 'typeorm';

export class DeviceAlarmRepository extends BaseRepository<DeviceAlarm> {
  constructor() {
    super(DeviceAlarm);
  }

  async findByDeviceId(deviceId: string): Promise<DeviceAlarm[]> {
    return this.repository.find({
      where: { deviceId },
      order: { triggerTime: 'ASC' },
    });
  }

  async findByDeviceIdAndAlarmId(deviceId: string, alarmId: number): Promise<DeviceAlarm | null> {
    return this.repository.findOne({
      where: { deviceId, id: alarmId },
    });
  }

  async findEnabledByDeviceId(deviceId: string): Promise<DeviceAlarm[]> {
    return this.repository.find({
      where: { deviceId, enabled: true },
      order: { triggerTime: 'ASC' },
    });
  }

  async findByType(deviceId: string, type: AlarmType): Promise<DeviceAlarm[]> {
    return this.repository.find({
      where: { deviceId, type },
      order: { triggerTime: 'ASC' },
    });
  }

  async findBySyncStatus(deviceId: string, syncStatus: SyncStatus): Promise<DeviceAlarm[]> {
    return this.repository.find({
      where: { deviceId, syncStatus },
      order: { triggerTime: 'ASC' },
    });
  }

  async findPendingSync(): Promise<DeviceAlarm[]> {
    return this.repository.find({
      where: { syncStatus: SyncStatus.PENDING },
      order: { updatedAt: 'ASC' },
    });
  }

  async findUpcoming(deviceId: string, limit: number = 10): Promise<DeviceAlarm[]> {
    const now = new Date();
    return this.repository.find({
      where: {
        deviceId,
        enabled: true,
        triggerTime: MoreThan(now),
      },
      order: { triggerTime: 'ASC' },
      take: limit,
    });
  }

  async deleteByDeviceId(deviceId: string): Promise<number> {
    const result = await this.repository.delete({ deviceId });
    return result.affected || 0;
  }

  async deleteByDeviceIdAndAlarmId(deviceId: string, alarmId: number): Promise<boolean> {
    const result = await this.repository.delete({ deviceId, id: alarmId });
    return result.affected !== null && result.affected !== undefined && result.affected > 0;
  }

  async updateSyncStatus(deviceId: string, alarmId: number, syncStatus: SyncStatus): Promise<boolean> {
    const result = await this.repository.update(
      { deviceId, id: alarmId },
      { syncStatus }
    );
    return result.affected !== null && result.affected !== undefined && result.affected > 0;
  }

  async updateAllSyncStatus(deviceId: string, syncStatus: SyncStatus): Promise<number> {
    const result = await this.repository.update(
      { deviceId },
      { syncStatus }
    );
    return result.affected || 0;
  }

  async countByDeviceId(deviceId: string): Promise<number> {
    return this.repository.count({
      where: { deviceId },
    });
  }

  async countEnabledByDeviceId(deviceId: string): Promise<number> {
    return this.repository.count({
      where: { deviceId, enabled: true },
    });
  }

  async getNextAlarmId(deviceId: string): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('alarm')
      .select('MAX(alarm.id)', 'maxId')
      .where('alarm.deviceId = :deviceId', { deviceId })
      .getRawOne();

    const maxId = result?.maxId ? parseInt(result.maxId, 10) : 0;
    return maxId + 1;
  }

  async bulkSave(alarms: Partial<DeviceAlarm>[]): Promise<DeviceAlarm[]> {
    return this.repository.save(alarms as any[]);
  }

  async bulkDelete(deviceId: string, alarmIds: number[]): Promise<number> {
    const result = await this.repository.delete({
      deviceId,
      id: In(alarmIds),
    });
    return result.affected || 0;
  }
}

let deviceAlarmRepositoryInstance: DeviceAlarmRepository | null = null;

export const getDeviceAlarmRepository = (): DeviceAlarmRepository => {
  if (!deviceAlarmRepositoryInstance) {
    deviceAlarmRepositoryInstance = new DeviceAlarmRepository();
  }
  return deviceAlarmRepositoryInstance;
};

export default DeviceAlarmRepository;

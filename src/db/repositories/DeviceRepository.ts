import { BaseRepository } from './BaseRepository.js';
import { Device } from '../entities/Device.js';
import { getAppDataSource } from '../connection.js';
import { Repository, In } from 'typeorm';

export class DeviceRepository extends BaseRepository<Device> {
  constructor() {
    super(Device);
  }

  async findByUserId(userId: string): Promise<Device[]> {
    return this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByEndpointId(endpointId: string): Promise<Device[]> {
    return this.repository.find({
      where: { endpointId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByStatus(status: string): Promise<Device[]> {
    return this.repository.find({
      where: { status },
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(deviceId: string, status: string): Promise<boolean> {
    const result = await this.repository.update(deviceId, { status });
    return result.affected !== null && result.affected !== undefined && result.affected > 0;
  }

  async updateLastSync(deviceId: string): Promise<boolean> {
    const result = await this.repository.update(deviceId, {
      lastSync: new Date(),
    });
    return result.affected !== null && result.affected !== undefined && result.affected > 0;
  }

  async updateDeviceMetadata(
    deviceId: string,
    metadata: Partial<Device['metadata']>,
  ): Promise<boolean> {
    const device = await this.findById(deviceId);
    if (!device) return false;

    const updatedMetadata = {
      ...device.metadata,
      ...metadata,
    };

    const result = await this.repository.update(deviceId, { metadata: updatedMetadata });
    return result.affected !== null && result.affected !== undefined && result.affected > 0;
  }

  async getDevicesWithAlarmCount(userId?: string): Promise<
    Array<{
      device: Device;
      alarmCount: number;
    }>
  > {
    const queryBuilder = this.repository
      .createQueryBuilder('device')
      .leftJoinAndSelect('device.alarms', 'alarm')
      .select('device', 'alarm');

    if (userId) {
      queryBuilder.where('device.userId = :userId', { userId });
    }

    const devices = await queryBuilder.getMany();

    return devices.map((device) => ({
      device,
      alarmCount: device.alarms?.length || 0,
    }));
  }
}

let deviceRepositoryInstance: DeviceRepository | null = null;

export const getDeviceRepository = (): DeviceRepository => {
  if (!deviceRepositoryInstance) {
    deviceRepositoryInstance = new DeviceRepository();
  }
  return deviceRepositoryInstance;
};

export default DeviceRepository;

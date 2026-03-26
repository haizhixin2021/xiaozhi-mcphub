import { getDeviceRepository } from '../db/repositories/DeviceRepository.js';
import { Device } from '../db/entities/Device.js';

export interface CreateDeviceParams {
  id: string;
  name: string;
  userId?: string;
  endpointId?: string;
  metadata?: Device['metadata'];
}

export interface UpdateDeviceParams {
  name?: string;
  userId?: string;
  endpointId?: string;
  metadata?: Partial<Device['metadata']>;
  status?: string;
}

class DeviceService {
  async getAllDevices(): Promise<Device[]> {
    const repo = getDeviceRepository();
    return repo.findAll();
  }

  async getDevicesByUserId(userId: string): Promise<Device[]> {
    const repo = getDeviceRepository();
    return repo.findByUserId(userId);
  }

  async getDevicesByEndpointId(endpointId: string): Promise<Device[]> {
    const repo = getDeviceRepository();
    return repo.findByEndpointId(endpointId);
  }

  async getDeviceById(deviceId: string): Promise<Device | null> {
    const repo = getDeviceRepository();
    return repo.findById(deviceId);
  }

  async createDevice(params: CreateDeviceParams): Promise<Device> {
    const repo = getDeviceRepository();
    
    const existingDevice = await repo.findById(params.id);
    if (existingDevice) {
      throw new Error(`Device with ID ${params.id} already exists`);
    }

    const device: Partial<Device> = {
      id: params.id,
      name: params.name,
      userId: params.userId || undefined,
      endpointId: params.endpointId || undefined,
      status: 'offline',
      metadata: params.metadata || {},
      lastSync: undefined,
    };

    return repo.save(device);
  }

  async updateDevice(deviceId: string, params: UpdateDeviceParams): Promise<Device> {
    const repo = getDeviceRepository();
    
    const device = await repo.findById(deviceId);
    if (!device) {
      throw new Error(`Device with ID ${deviceId} not found`);
    }

    const updateData: Partial<Device> = {};
    if (params.name !== undefined) updateData.name = params.name;
    if (params.userId !== undefined) updateData.userId = params.userId;
    if (params.endpointId !== undefined) updateData.endpointId = params.endpointId;
    if (params.status !== undefined) updateData.status = params.status;
    if (params.metadata !== undefined) {
      updateData.metadata = {
        ...device.metadata,
        ...params.metadata,
      };
    }

    return repo.save({ ...device, ...updateData });
  }

  async deleteDevice(deviceId: string): Promise<boolean> {
    const repo = getDeviceRepository();
    const device = await repo.findById(deviceId);
    if (!device) {
      return false;
    }
    return repo.delete(deviceId);
  }

  async updateDeviceStatus(deviceId: string, status: 'online' | 'offline'): Promise<boolean> {
    const repo = getDeviceRepository();
    return repo.updateStatus(deviceId, status);
  }

  async updateLastSync(deviceId: string): Promise<boolean> {
    const repo = getDeviceRepository();
    return repo.updateLastSync(deviceId);
  }

  async getDevicesWithAlarmCount(userId?: string): Promise<
    Array<{
      device: Device;
      alarmCount: number;
    }>
  > {
    const repo = getDeviceRepository();
    return repo.getDevicesWithAlarmCount(userId);
  }

  async registerOrUpdateDevice(params: CreateDeviceParams): Promise<Device> {
    const repo = getDeviceRepository();
    const existingDevice = await repo.findById(params.id);

    if (existingDevice) {
      return this.updateDevice(params.id, {
        name: params.name,
        metadata: params.metadata,
        status: 'online',
      });
    }

    return this.createDevice({
      ...params,
      status: 'online',
    } as CreateDeviceParams & { status: string });
  }
}

export const deviceService = new DeviceService();
export default deviceService;

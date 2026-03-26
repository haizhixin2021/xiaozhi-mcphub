import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Device } from './Device.js';

export enum AlarmType {
  COUNTDOWN = 0,
  SCHEDULED = 1,
  REPEATING = 2,
}

export enum SyncStatus {
  SYNCED = 'synced',
  PENDING = 'pending',
  CONFLICT = 'conflict',
}

@Entity({ name: 'device_alarms' })
export class DeviceAlarm {
  @PrimaryColumn({ type: 'integer' })
  id: number;

  @PrimaryColumn({ type: 'varchar', name: 'device_id' })
  deviceId: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'timestamp', name: 'trigger_time' })
  triggerTime: Date;

  @Column({ type: 'integer', nullable: true })
  hour: number;

  @Column({ type: 'integer', nullable: true })
  minute: number;

  @Column({ type: 'integer', name: 'repeat_count', default: 1 })
  repeatCount: number;

  @Column({ type: 'integer', default: 0 })
  interval: number;

  @Column({ type: 'boolean', default: true })
  enabled: boolean;

  @Column({
    type: 'integer',
    default: AlarmType.COUNTDOWN,
  })
  type: AlarmType;

  @Column({
    type: 'varchar',
    name: 'sync_status',
    default: SyncStatus.SYNCED,
  })
  syncStatus: SyncStatus;

  @Column({ type: 'timestamp', name: 'device_created_at', nullable: true })
  deviceCreatedAt: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => Device, (device) => device.alarms)
  @JoinColumn({ name: 'device_id' })
  device: Device;

  getTypeStr(): string {
    switch (this.type) {
      case AlarmType.SCHEDULED:
        return 'scheduled';
      case AlarmType.REPEATING:
        return 'repeating';
      default:
        return 'countdown';
    }
  }

  toJSON(): Record<string, any> {
    return {
      id: this.id,
      deviceId: this.deviceId,
      name: this.name,
      triggerTime: this.triggerTime.toISOString(),
      triggerTimeStr: this.formatTriggerTime(),
      hour: this.hour,
      minute: this.minute,
      repeatCount: this.repeatCount,
      interval: this.interval,
      enabled: this.enabled,
      type: this.type,
      typeStr: this.getTypeStr(),
      syncStatus: this.syncStatus,
    };
  }

  private formatTriggerTime(): string {
    const date = new Date(this.triggerTime);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).replace(/\//g, '-');
  }
}

export default DeviceAlarm;

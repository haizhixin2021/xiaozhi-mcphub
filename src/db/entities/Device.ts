import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity({ name: 'devices' })
export class Device {
  @PrimaryColumn({ type: 'varchar' })
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', name: 'user_id', nullable: true })
  userId: string;

  @Column({ type: 'varchar', name: 'endpoint_id', nullable: true })
  endpointId: string;

  @Column({ type: 'timestamp', name: 'last_sync', nullable: true })
  lastSync: Date;

  @Column({ type: 'varchar', default: 'offline' })
  status: string;

  @Column({ type: 'simple-json', nullable: true })
  metadata: {
    macAddress?: string;
    firmwareVersion?: string;
    hardwareVersion?: string;
    ipAddress?: string;
  };

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @OneToMany('DeviceAlarm', 'device')
  alarms: any[];
}

export default Device;

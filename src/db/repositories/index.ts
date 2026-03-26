import VectorEmbeddingRepository from './VectorEmbeddingRepository.js';
import McpServerRepository from './McpServerRepository.js';
import GroupRepository, { getGroupRepository } from './GroupRepository.js';
import XiaozhiEndpointRepository, { getXiaozhiEndpointRepository } from './XiaozhiEndpointRepository.js';
import XiaozhiConfigRepository, { getXiaozhiConfigRepository } from './XiaozhiConfigRepository.js';
import DeviceRepository, { getDeviceRepository } from './DeviceRepository.js';
import DeviceAlarmRepository, { getDeviceAlarmRepository } from './DeviceAlarmRepository.js';

// Export all repositories
export {
  VectorEmbeddingRepository,
  McpServerRepository,
  GroupRepository,
  XiaozhiEndpointRepository,
  XiaozhiConfigRepository,
  DeviceRepository,
  DeviceAlarmRepository,
  getXiaozhiEndpointRepository,
  getXiaozhiConfigRepository,
  getGroupRepository,
  getDeviceRepository,
  getDeviceAlarmRepository,
};

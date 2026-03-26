// Export individual entities for direct use
import { VectorEmbedding } from './VectorEmbedding.js';
import { User } from './User.js';
import { McpServer } from './McpServer.js';
import { Group } from './Group.js';
import { XiaozhiEndpoint } from './XiaozhiEndpoint.js';
import { SystemConfig } from './SystemConfig.js';
import { XiaozhiConfig } from './XiaozhiConfig.js';
import { Device } from './Device.js';
import { DeviceAlarm } from './DeviceAlarm.js';

// Unified entities array
export const entities = [
  VectorEmbedding,
  User,
  McpServer,
  Group,
  XiaozhiEndpoint,
  SystemConfig,
  XiaozhiConfig,
  Device,
  DeviceAlarm,
];

// Re-exports for direct imports
export {
  VectorEmbedding,
  User,
  McpServer,
  Group,
  XiaozhiEndpoint,
  SystemConfig,
  XiaozhiConfig,
  Device,
  DeviceAlarm,
};

// Default export for backward compatibility
export default entities;

import { Request, Response } from 'express';
import { deviceService } from '../services/deviceService.js';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export const getAllDevices = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    let devices;

    if (user && !user.isAdmin) {
      devices = await deviceService.getDevicesByUserId(user.username);
    } else {
      devices = await deviceService.getAllDevices();
    }

    res.json({
      success: true,
      data: devices,
    } as ApiResponse);
  } catch (error) {
    console.error('Error getting devices:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get devices',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ApiResponse);
  }
};

export const getDevice = async (req: Request, res: Response): Promise<void> => {
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

    res.json({
      success: true,
      data: device,
    } as ApiResponse);
  } catch (error) {
    console.error('Error getting device:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get device',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ApiResponse);
  }
};

export const createDevice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, name, userId, endpointId, metadata } = req.body;

    if (!id || !name) {
      res.status(400).json({
        success: false,
        message: 'Device ID and name are required',
      } as ApiResponse);
      return;
    }

    const device = await deviceService.createDevice({
      id,
      name,
      userId,
      endpointId,
      metadata,
    });

    res.status(201).json({
      success: true,
      data: device,
      message: 'Device created successfully',
    } as ApiResponse);
  } catch (error) {
    console.error('Error creating device:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create device',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ApiResponse);
  }
};

export const updateDevice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { deviceId } = req.params;
    const { name, userId, endpointId, metadata, status } = req.body;

    const device = await deviceService.updateDevice(deviceId, {
      name,
      userId,
      endpointId,
      metadata,
      status,
    });

    res.json({
      success: true,
      data: device,
      message: 'Device updated successfully',
    } as ApiResponse);
  } catch (error) {
    console.error('Error updating device:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update device',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ApiResponse);
  }
};

export const deleteDevice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { deviceId } = req.params;
    const deleted = await deviceService.deleteDevice(deviceId);

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: 'Device not found',
      } as ApiResponse);
      return;
    }

    res.json({
      success: true,
      message: 'Device deleted successfully',
    } as ApiResponse);
  } catch (error) {
    console.error('Error deleting device:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete device',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ApiResponse);
  }
};

export const getDevicesWithAlarmCount = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const user = (req as any).user;
    const userId = user && !user.isAdmin ? user.username : undefined;

    const devices = await deviceService.getDevicesWithAlarmCount(userId);

    res.json({
      success: true,
      data: devices,
    } as ApiResponse);
  } catch (error) {
    console.error('Error getting devices with alarm count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get devices',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ApiResponse);
  }
};

export const registerDevice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, name, metadata } = req.body;

    if (!id || !name) {
      res.status(400).json({
        success: false,
        message: 'Device ID and name are required',
      } as ApiResponse);
      return;
    }

    const device = await deviceService.registerOrUpdateDevice({
      id,
      name,
      metadata,
    });

    res.json({
      success: true,
      data: device,
      message: 'Device registered successfully',
    } as ApiResponse);
  } catch (error) {
    console.error('Error registering device:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register device',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ApiResponse);
  }
};

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDevicesWithAlarmCount } from '@/hooks/useDeviceData';
import { useAlarmActions } from '@/hooks/useAlarmData';
import AlarmCard from '@/components/AlarmCard';
import AddAlarmForm from '@/components/AddAlarmForm';
import EditAlarmForm from '@/components/EditAlarmForm';
import { Alarm } from '@/services/alarmService';

const AlarmsPage: React.FC = () => {
  const { t } = useTranslation();
  const { devices, loading: devicesLoading, refetch: refetchDevices } = useDevicesWithAlarmCount();
  const { sync, loading: syncLoading, error: syncError } = useAlarmActions();
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [alarmsLoading, setAlarmsLoading] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState<Alarm | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const handleDeviceSelect = async (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    setAlarmsLoading(true);
    try {
      const { getDeviceAlarms } = await import('@/services/alarmService');
      const data = await getDeviceAlarms(deviceId);
      setAlarms(data);
    } catch (error) {
      console.error('Failed to fetch alarms:', error);
    } finally {
      setAlarmsLoading(false);
    }
  };

  const handleSync = async () => {
    if (!selectedDeviceId) return;
    setSyncMessage(null);
    const success = await sync(selectedDeviceId);
    if (success) {
      setSyncMessage(t('alarms.syncSuccess'));
      handleDeviceSelect(selectedDeviceId);
    } else if (syncError) {
      setSyncMessage(syncError);
    }
  };

  const handleAlarmAdded = () => {
    setShowAddForm(false);
    if (selectedDeviceId) {
      handleDeviceSelect(selectedDeviceId);
      refetchDevices();
    }
  };

  const handleAlarmUpdated = () => {
    setEditingAlarm(null);
    if (selectedDeviceId) {
      handleDeviceSelect(selectedDeviceId);
    }
  };

  const handleAlarmDeleted = () => {
    if (selectedDeviceId) {
      handleDeviceSelect(selectedDeviceId);
      refetchDevices();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t('pages.alarms.title')}</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowAddForm(true)}
            disabled={!selectedDeviceId}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title={!selectedDeviceId ? t('alarms.selectDeviceFirst') : ''}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            {t('alarms.add')}
          </button>
          <button
            onClick={handleSync}
            disabled={!selectedDeviceId || syncLoading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title={!selectedDeviceId ? t('alarms.selectDeviceFirst') : ''}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                clipRule="evenodd"
              />
            </svg>
            {t('alarms.sync')}
          </button>
        </div>
      </div>

      {syncMessage && (
        <div className={`mt-4 p-4 rounded ${syncMessage.includes('success') || syncMessage.includes('成功') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {syncMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4">{t('alarms.devices')}</h2>
            {devicesLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              </div>
            ) : devices.length === 0 ? (
              <p className="text-gray-500 text-center py-4">{t('alarms.noDevices')}</p>
            ) : (
              <div className="space-y-2">
                {devices.map(({ device, alarmCount }) => (
                  <div
                    key={device.id}
                    onClick={() => handleDeviceSelect(device.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      selectedDeviceId === device.id
                        ? 'bg-blue-50 border-2 border-blue-500'
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span
                          className={`w-2 h-2 rounded-full mr-2 ${
                            device.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                          }`}
                        ></span>
                        <span className="font-medium">{device.name}</span>
                      </div>
                      <span className="text-sm text-gray-500">{alarmCount}</span>
                    </div>
                    {device.metadata?.macAddress && (
                      <p className="text-xs text-gray-400 mt-1">{device.metadata.macAddress}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-3">
          {!selectedDeviceId ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mx-auto text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-gray-500">{t('alarms.selectDevice')}</p>
            </div>
          ) : alarmsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : alarms.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mx-auto text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-gray-500">{t('alarms.noAlarms')}</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {t('alarms.addFirst')}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {alarms.map((alarm) => (
                <AlarmCard
                  key={`${alarm.deviceId}-${alarm.id}`}
                  alarm={alarm}
                  onEdit={() => setEditingAlarm(alarm)}
                  onDelete={handleAlarmDeleted}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showAddForm && selectedDeviceId && (
        <AddAlarmForm
          deviceId={selectedDeviceId}
          onClose={() => setShowAddForm(false)}
          onSuccess={handleAlarmAdded}
        />
      )}

      {editingAlarm && (
        <EditAlarmForm
          alarm={editingAlarm}
          onClose={() => setEditingAlarm(null)}
          onSuccess={handleAlarmUpdated}
        />
      )}
    </div>
  );
};

export default AlarmsPage;

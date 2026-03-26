import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAlarmActions } from '@/hooks/useAlarmData';
import { CreateAlarmRequest } from '@/services/alarmService';

interface AddAlarmFormProps {
  deviceId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const AddAlarmForm: React.FC<AddAlarmFormProps> = ({ deviceId, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const { create, loading, error } = useAlarmActions();

  const [formData, setFormData] = useState<CreateAlarmRequest>({
    name: '',
    delay: 60,
    hour: 255,
    minute: 255,
    repeat: 1,
    interval: 86400,
  });
  const [alarmType, setAlarmType] = useState<'scheduled' | 'countdown'>('scheduled');
  const [repeatType, setRepeatType] = useState<'once' | 'daily' | 'custom'>('once');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data: CreateAlarmRequest = {
      name: formData.name,
      repeat: repeatType === 'once' ? 1 : repeatType === 'daily' ? -1 : formData.repeat,
      interval: formData.interval || 86400,
    };

    if (alarmType === 'scheduled') {
      data.hour = formData.hour;
      data.minute = formData.minute;
    } else {
      data.delay = formData.delay;
    }

    const result = await create(deviceId, data);
    if (result) {
      onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{t('alarms.add')}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('alarms.name')} *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('alarms.namePlaceholder')}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('alarms.type')}
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="alarmType"
                  value="scheduled"
                  checked={alarmType === 'scheduled'}
                  onChange={() => setAlarmType('scheduled')}
                  className="mr-2"
                />
                {t('alarms.scheduled')}
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="alarmType"
                  value="countdown"
                  checked={alarmType === 'countdown'}
                  onChange={() => setAlarmType('countdown')}
                  className="mr-2"
                />
                {t('alarms.countdown')}
              </label>
            </div>
          </div>

          {alarmType === 'scheduled' ? (
            <div className="flex space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('alarms.hour')}
                </label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={formData.hour === 255 ? 0 : formData.hour}
                  onChange={(e) => setFormData({ ...formData, hour: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('alarms.minute')}
                </label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={formData.minute === 255 ? 0 : formData.minute}
                  onChange={(e) => setFormData({ ...formData, minute: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('alarms.delay')} ({t('alarms.seconds')})
              </label>
              <input
                type="number"
                min="1"
                max="86400"
                value={formData.delay}
                onChange={(e) => setFormData({ ...formData, delay: parseInt(e.target.value) || 60 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('alarms.repeat')}
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="repeatType"
                  value="once"
                  checked={repeatType === 'once'}
                  onChange={() => setRepeatType('once')}
                  className="mr-2"
                />
                {t('alarms.once')}
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="repeatType"
                  value="daily"
                  checked={repeatType === 'daily'}
                  onChange={() => setRepeatType('daily')}
                  className="mr-2"
                />
                {t('alarms.daily')}
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="repeatType"
                  value="custom"
                  checked={repeatType === 'custom'}
                  onChange={() => setRepeatType('custom')}
                  className="mr-2"
                />
                {t('alarms.custom')}
              </label>
            </div>
          </div>

          {repeatType === 'custom' && (
            <div className="flex space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('alarms.repeatCount')}
                </label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={formData.repeat}
                  onChange={(e) => setFormData({ ...formData, repeat: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('alarms.interval')} ({t('alarms.seconds')})
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.interval}
                  onChange={(e) => setFormData({ ...formData, interval: parseInt(e.target.value) || 86400 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? t('common.saving') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAlarmForm;

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAlarmActions } from '@/hooks/useAlarmData';
import { Alarm, UpdateAlarmRequest } from '@/services/alarmService';

interface EditAlarmFormProps {
  alarm: Alarm;
  onClose: () => void;
  onSuccess: () => void;
}

const EditAlarmForm: React.FC<EditAlarmFormProps> = ({ alarm, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const { update, loading, error } = useAlarmActions();

  const [formData, setFormData] = useState<UpdateAlarmRequest>({
    name: alarm.name,
    hour: alarm.hour >= 0 ? alarm.hour : undefined,
    minute: alarm.minute >= 0 ? alarm.minute : undefined,
    repeat: alarm.repeatCount,
    interval: alarm.interval,
    enabled: alarm.enabled,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await update(alarm.deviceId, alarm.id, formData);
    if (result) {
      onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{t('alarms.edit')}</h2>
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
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {(alarm.typeStr === 'scheduled' || alarm.typeStr === 'repeating') && (
            <div className="flex space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('alarms.hour')}
                </label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={formData.hour ?? 0}
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
                  value={formData.minute ?? 0}
                  onChange={(e) => setFormData({ ...formData, minute: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('alarms.repeatCount')}
              </label>
              <input
                type="number"
                min="-1"
                max="10000"
                value={formData.repeat ?? 1}
                onChange={(e) => setFormData({ ...formData, repeat: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">-1 = {t('alarms.infinite')}</p>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('alarms.interval')} ({t('alarms.seconds')})
              </label>
              <input
                type="number"
                min="1"
                value={formData.interval ?? 86400}
                onChange={(e) => setFormData({ ...formData, interval: parseInt(e.target.value) || 86400 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="enabled"
              checked={formData.enabled ?? true}
              onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="enabled" className="text-sm font-medium text-gray-700">
              {t('alarms.enabled')}
            </label>
          </div>

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

export default EditAlarmForm;

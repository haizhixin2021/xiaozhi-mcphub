import React from 'react';
import { useTranslation } from 'react-i18next';
import { Alarm, getAlarmTypeLabel, getRepeatLabel } from '@/services/alarmService';
import { useAlarmActions } from '@/hooks/useAlarmData';

interface AlarmCardProps {
  alarm: Alarm;
  onEdit: () => void;
  onDelete: () => void;
}

const AlarmCard: React.FC<AlarmCardProps> = ({ alarm, onEdit, onDelete }) => {
  const { t } = useTranslation();
  const { remove, loading } = useAlarmActions();

  const handleDelete = async () => {
    if (window.confirm(t('alarms.confirmDelete'))) {
      const success = await remove(alarm.deviceId, alarm.id);
      if (success) {
        onDelete();
      }
    }
  };

  const getTypeIcon = () => {
    switch (alarm.typeStr) {
      case 'scheduled':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'repeating':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div
            className={`p-2 rounded-lg ${
              alarm.enabled ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
            }`}
          >
            {getTypeIcon()}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              {alarm.typeStr === 'scheduled' || alarm.typeStr === 'repeating' ? (
                <span className="text-2xl font-bold">
                  {String(alarm.hour).padStart(2, '0')}:
                  {String(alarm.minute).padStart(2, '0')}
                </span>
              ) : (
                <span className="text-lg font-semibold">{t('alarms.countdown')}</span>
              )}
              <span
                className={`px-2 py-1 text-xs rounded ${
                  alarm.enabled
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {alarm.enabled ? t('alarms.enabled') : t('alarms.disabled')}
              </span>
            </div>
            <p className="text-gray-700 mt-1">{alarm.name}</p>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z"
                    clipRule="evenodd"
                  />
                </svg>
                {getAlarmTypeLabel(alarm.typeStr)}
              </span>
              <span className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                {getRepeatLabel(alarm.repeatCount, alarm.interval)}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {t('alarms.nextTrigger')}: {alarm.triggerTimeStr}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title={t('common.edit')}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
            title={t('common.delete')}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
      {alarm.syncStatus === 'pending' && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <span className="text-xs text-yellow-600 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
            {t('alarms.pendingSync')}
          </span>
        </div>
      )}
    </div>
  );
};

export default AlarmCard;

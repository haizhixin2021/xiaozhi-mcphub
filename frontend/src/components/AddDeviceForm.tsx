import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface AddDeviceFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const AddDeviceForm: React.FC<AddDeviceFormProps> = ({ onClose, onSuccess }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    macAddress: '',
    ipAddress: '',
    firmwareVersion: '',
    hardwareVersion: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.id.trim() || !formData.name.trim()) {
      setError(t('devices.idRequired'));
      setLoading(false);
      return;
    }

    try {
      const { createDevice } = await import('@/services/deviceService');
      await createDevice({
        id: formData.id.trim(),
        name: formData.name.trim(),
        metadata: {
          macAddress: formData.macAddress.trim() || undefined,
          ipAddress: formData.ipAddress.trim() || undefined,
          firmwareVersion: formData.firmwareVersion.trim() || undefined,
          hardwareVersion: formData.hardwareVersion.trim() || undefined,
        },
      });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('devices.createError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">{t('devices.add')}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('devices.deviceId')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="id"
              value={formData.id}
              onChange={handleChange}
              placeholder={t('devices.deviceIdPlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('devices.name')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder={t('devices.namePlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('devices.macAddress')}
            </label>
            <input
              type="text"
              name="macAddress"
              value={formData.macAddress}
              onChange={handleChange}
              placeholder={t('devices.macAddressPlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('devices.ipAddress')}
            </label>
            <input
              type="text"
              name="ipAddress"
              value={formData.ipAddress}
              onChange={handleChange}
              placeholder={t('devices.ipAddressPlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('devices.firmware')}
            </label>
            <input
              type="text"
              name="firmwareVersion"
              value={formData.firmwareVersion}
              onChange={handleChange}
              placeholder={t('devices.firmwarePlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('devices.hardware')}
            </label>
            <input
              type="text"
              name="hardwareVersion"
              value={formData.hardwareVersion}
              onChange={handleChange}
              placeholder={t('devices.hardwarePlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {loading ? t('common.creating') : t('common.create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDeviceForm;

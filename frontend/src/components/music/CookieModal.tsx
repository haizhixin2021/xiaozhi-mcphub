import React, { useState, useEffect } from 'react';
import { musicService, CookieData } from '../../services/musicService';

interface CookieModalProps {
  onClose: () => void;
}

const CookieModal: React.FC<CookieModalProps> = ({ onClose }) => {
  const [cookies, setCookies] = useState<CookieData>({
    netease: '',
    qq: '',
    kugou: '',
    kuwo: '',
    migu: '',
    fivesing: '',
    jamendo: '',
    joox: '',
    qianqian: '',
    soda: '',
    bilibili: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCookies();
  }, []);

  const loadCookies = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await musicService.getCookies();
      setCookies(data);
    } catch (err) {
      setError('获取 Cookie 失败');
      console.error('获取 Cookie 失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveCookies = async () => {
    try {
      setSaving(true);
      setError(null);
      await musicService.setCookies(cookies);
      onClose();
    } catch (err) {
      setError('保存 Cookie 失败');
      console.error('保存 Cookie 失败:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: keyof CookieData, value: string) => {
    setCookies(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const platforms = [
    { id: 'netease' as const, label: '网易云音乐' },
    { id: 'qq' as const, label: 'QQ音乐' },
    { id: 'kugou' as const, label: '酷狗音乐' },
    { id: 'kuwo' as const, label: '酷我音乐' },
    { id: 'migu' as const, label: '咪咕音乐' },
    { id: 'fivesing' as const, label: '5sing' },
    { id: 'jamendo' as const, label: 'Jamendo (CC)' },
    { id: 'joox' as const, label: 'JOOX' },
    { id: 'qianqian' as const, label: '千千音乐' },
    { id: 'soda' as const, label: 'Soda音乐' },
    { id: 'bilibili' as const, label: '哔哩哔哩' },
  ];

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-700 dark:text-gray-300">加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            🔒 设置 Cookies
          </h3>
          <div className="flex gap-2">
            <button
              onClick={saveCookies}
              disabled={saving}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {saving ? '保存中...' : '保存'}
            </button>
            <button
              onClick={onClose}
              disabled={saving}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="overflow-y-auto max-h-[60vh] p-4">
          <div className="space-y-4">
            {platforms.map((platform) => (
              <div key={platform.id}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {platform.id}
                </label>
                <textarea
                  value={cookies[platform.id] || ''}
                  onChange={(e) => handleChange(platform.id, e.target.value)}
                  placeholder="在此粘贴 Cookie..."
                  className="w-full p-3 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  rows={2}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            💡 提示：Cookie 用于访问部分音乐平台的受限内容，如需要登录才能访问的歌单。
          </p>
        </div>
      </div>
    </div>
  );
};

export default CookieModal;

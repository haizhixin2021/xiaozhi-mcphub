import React, { useState, useEffect } from 'react';
import { Song } from '../../services/musicService';

interface ChangeSourceModalProps {
  song: Song;
  onClose: () => void;
  onChangeSource: (song: Song, targetSource?: string) => Promise<Song | null>;
  onPlay: (song: Song) => void;
}

const SOURCES = [
  { id: 'netease', name: '网易云', color: 'bg-red-100 text-red-700' },
  { id: 'qq', name: 'QQ音乐', color: 'bg-green-100 text-green-700' },
  { id: 'kugou', name: '酷狗', color: 'bg-sky-200 text-sky-800' },
  { id: 'kuwo', name: '酷我', color: 'bg-orange-100 text-orange-700' },
  { id: 'migu', name: '咪咕', color: 'bg-pink-100 text-pink-700' },
  { id: 'bilibili', name: 'B站', color: 'bg-pink-100 text-pink-700' },
  { id: 'qianqian', name: '千千', color: 'bg-cyan-100 text-cyan-700' },
];

const ChangeSourceModal: React.FC<ChangeSourceModalProps> = ({
  song,
  onClose,
  onChangeSource,
  onPlay,
}) => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Song[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (targetSource?: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await onChangeSource(song, targetSource);
      if (result) {
        setResults([result]);
      } else {
        setError('未找到其他来源');
      }
    } catch (err) {
      setError('切换来源失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, []);

  const getSourceColor = (source: string) => {
    const found = SOURCES.find(s => s.id === source);
    return found?.color || 'bg-gray-100 text-gray-700';
  };

  const getSourceName = (source: string) => {
    const found = SOURCES.find(s => s.id === source);
    return found?.name || source;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden dark:bg-gray-800">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">切换来源</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {song.name} - {song.artist}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {SOURCES.filter(s => s.id !== song.source).map(source => (
              <button
                key={source.id}
                onClick={() => handleSearch(source.id)}
                disabled={loading}
                className={`px-3 py-1.5 text-sm rounded-full transition-all ${
                  loading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'
                } ${source.color}`}
              >
                {source.name}
              </button>
            ))}
          </div>

          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}

          {error && (
            <div className="text-center py-8 text-gray-500">
              {error}
            </div>
          )}

          {!loading && !error && results.length > 0 && (
            <div className="space-y-3">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg dark:bg-gray-700"
                >
                  <img
                    src={result.cover || '/default-cover.png'}
                    alt={result.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate dark:text-white">
                      {result.name}
                    </h4>
                    <p className="text-sm text-gray-500 truncate dark:text-gray-400">
                      {result.artist} - {result.album}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getSourceColor(result.source)}`}>
                        {getSourceName(result.source)}
                      </span>
                      {result.bitrate && (
                        <span className="text-xs text-gray-400">{result.bitrate}kbps</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onPlay(result);
                      onClose();
                    }}
                    className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChangeSourceModal;

import React from 'react';
import { Song } from '../../services/musicService';

interface PlayerBarProps {
  song: Song | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onClose?: () => void;
}

const PlayerBar: React.FC<PlayerBarProps> = ({
  song,
  isPlaying,
  onTogglePlay,
  onClose,
}) => {
  if (!song) return null;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg dark:bg-gray-800 dark:border-gray-700 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          <img
            src={song.cover || '/default-cover.png'}
            alt={song.name}
            className="w-12 h-12 rounded-lg object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23e5e7eb" width="100" height="100"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="40">🎵</text></svg>';
            }}
          />

          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 truncate dark:text-white">
              {song.name}
            </h4>
            <p className="text-sm text-gray-500 truncate dark:text-gray-400">
              {song.artist}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onTogglePlay}
              className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
            >
              {isPlaying ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerBar;

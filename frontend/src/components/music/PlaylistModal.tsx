import React from 'react';
import { Song } from '../../services/musicService';

interface PlaylistModalProps {
  playlist: Song[];
  currentIndex: number;
  currentSong: Song | null;
  isPlaying: boolean;
  onClose: () => void;
  onPlaySong: (song: Song, songList: Song[]) => void;
}

const PlaylistModal: React.FC<PlaylistModalProps> = ({
  playlist,
  currentIndex,
  currentSong,
  isPlaying,
  onClose,
  onPlaySong,
}) => {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            🎵 播放列表 ({playlist.length}首)
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto max-h-[60vh]">
          {playlist.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <p>播放列表为空</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {playlist.map((song, index) => {
                const isCurrentSong = currentSong?.id === song.id && currentSong?.source === song.source;
                return (
                  <div
                    key={`${song.source}-${song.id}-${index}`}
                    onClick={() => onPlaySong(song, playlist)}
                    className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                      isCurrentSong 
                        ? 'bg-blue-50 dark:bg-blue-900/30' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <div className="w-8 text-center">
                      {isCurrentSong ? (
                        <span className="text-blue-500">
                          {isPlaying ? (
                            <svg className="w-5 h-5 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          )}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">{index + 1}</span>
                      )}
                    </div>

                    <img
                      src={song.cover || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23e5e7eb" width="100" height="100"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="40">🎵</text></svg>'}
                      alt={song.name}
                      className="w-10 h-10 rounded object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23e5e7eb" width="100" height="100"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="40">🎵</text></svg>';
                      }}
                    />

                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate ${isCurrentSong ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                        {song.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {song.artist}
                      </p>
                    </div>

                    <span className="text-sm text-gray-400">
                      {formatDuration(song.duration)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaylistModal;

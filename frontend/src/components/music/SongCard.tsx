import React, { useState } from 'react';
import { Song } from '../../services/musicService';

interface SongCardProps {
  song: Song;
  onPlay: (song: Song) => void;
  isPlaying?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (song: Song) => void;
  onChangeSource?: (song: Song) => void;
  onShowLyrics?: (song: Song) => void;
  onDownloadSong?: (song: Song) => void;
  onDownloadLyric?: (song: Song) => void;
  onDownloadCover?: (song: Song) => void;
}

const SongCard: React.FC<SongCardProps> = ({
  song,
  onPlay,
  isPlaying,
  isFavorite,
  onToggleFavorite,
  onChangeSource,
  onShowLyrics,
  onDownloadSong,
  onDownloadLyric,
  onDownloadCover,
}) => {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
  };

  const formatBitrate = (bitrate: number) => {
    return `${bitrate}kbps`;
  };

  const getSourceColor = (source: string) => {
    const colors: Record<string, string> = {
      netease: 'bg-red-100 text-red-700',
      qq: 'bg-green-100 text-green-700',
      kugou: 'bg-sky-200 text-sky-800',
      kuwo: 'bg-orange-100 text-orange-700',
      migu: 'bg-pink-100 text-pink-700',
      fivesing: 'bg-purple-100 text-purple-700',
      jamendo: 'bg-teal-100 text-teal-700',
      joox: 'bg-indigo-100 text-indigo-700',
      qianqian: 'bg-cyan-100 text-cyan-700',
      soda: 'bg-lime-100 text-lime-700',
      bilibili: 'bg-pink-100 text-pink-700',
    };
    return colors[source] || 'bg-gray-100 text-gray-700';
  };

  const getSourceName = (source: string) => {
    const names: Record<string, string> = {
      netease: '网易云',
      qq: 'QQ音乐',
      kugou: '酷狗',
      kuwo: '酷我',
      migu: '咪咕',
      fivesing: '5sing',
      jamendo: 'Jamendo',
      joox: 'JOOX',
      qianqian: '千千',
      soda: 'Soda',
      bilibili: 'B站',
    };
    return names[source] || source;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0">
          <img
            src={song.cover || '/default-cover.png'}
            alt={song.name}
            className="w-14 h-14 rounded-lg object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23e5e7eb" width="100" height="100"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="40">🎵</text></svg>';
            }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-gray-900 truncate dark:text-white">
              {song.name}
            </h3>
            <span
              className={`px-2 py-0.5 text-xs rounded-full ${getSourceColor(song.source)}`}
            >
              {getSourceName(song.source)}
            </span>
          </div>
          <p className="text-sm text-gray-500 truncate dark:text-gray-400">
            {song.artist} - {song.album}
          </p>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
            <span>⏱ {formatDuration(song.duration)}</span>
            {song.size && <span>📦 {formatSize(song.size)}</span>}
            {song.bitrate && <span>🎧 {formatBitrate(song.bitrate)}</span>}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onPlay(song)}
            className={`p-2 rounded-full transition-colors ${
              isPlaying
                ? 'text-green-500 bg-green-50 dark:bg-green-900/30'
                : 'text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/30'
            }`}
            title="播放"
          >
            {isPlaying ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <button
            onClick={() => onToggleFavorite?.(song)}
            className={`p-2 rounded-full transition-colors ${
              isFavorite
                ? 'text-red-500 bg-red-50 dark:bg-red-900/30'
                : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30'
            }`}
            title={isFavorite ? '取消收藏' : '收藏'}
          >
            <svg className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>

          <button
            onClick={() => onChangeSource?.(song)}
            className="p-2 text-gray-400 hover:text-purple-500 hover:bg-purple-50 rounded-full transition-colors dark:hover:bg-purple-900/30"
            title="切换来源"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
          </button>

          <button
            onClick={() => onShowLyrics?.(song)}
            className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors dark:hover:bg-blue-900/30"
            title="歌词"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </button>

          <button
            onClick={() => onDownloadSong?.(song)}
            className="p-2 text-gray-400 hover:text-teal-500 hover:bg-teal-50 rounded-full transition-colors dark:hover:bg-teal-900/30"
            title="下载歌曲"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>

          <button
            onClick={() => onDownloadLyric?.(song)}
            className="p-2 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-full transition-colors dark:hover:bg-amber-900/30"
            title="下载歌词"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>

          <button
            onClick={() => onDownloadCover?.(song)}
            className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors dark:hover:bg-rose-900/30"
            title="下载封面"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SongCard;

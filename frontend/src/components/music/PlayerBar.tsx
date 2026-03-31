import React, { useState, useEffect, useRef } from 'react';
import { Song } from '../../services/musicService';
import PlaylistModal from './PlaylistModal';

interface PlayerBarProps {
  song: Song | null;
  isPlaying: boolean;
  currentTime: number;
  playlist: Song[];
  currentIndex: number;
  onTogglePlay: () => void;
  onClose?: () => void;
  onGetLyrics: (song: Song) => Promise<string | null>;
  onSeek: (time: number) => void;
  onPlaySong: (song: Song, songList: Song[]) => void;
}

const PlayerBar: React.FC<PlayerBarProps> = ({
  song,
  isPlaying,
  currentTime,
  playlist,
  currentIndex,
  onTogglePlay,
  onClose,
  onGetLyrics,
  onSeek,
  onPlaySong,
}) => {
  const [lyrics, setLyrics] = useState<{ time: number; text: string }[]>([]);
  const [currentLyricIndex, setCurrentLyricIndex] = useState<number>(-1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime] = useState(0);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const lastSongKeyRef = useRef<string | null>(null);

  const parseLyrics = (lrc: string) => {
    if (!lrc || typeof lrc !== 'string') {
      return [];
    }
    const lines = lrc.split('\n');
    const parsed: { time: number; text: string }[] = [];
    const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/g;

    lines.forEach(line => {
      const matches = [...line.matchAll(timeRegex)];
      if (matches.length > 0) {
        const text = line.replace(timeRegex, '').trim();
        if (text) {
          matches.forEach(match => {
            const minutes = parseInt(match[1]);
            const seconds = parseInt(match[2]);
            const ms = parseInt(match[3].padEnd(3, '0'));
            const time = minutes * 60 + seconds + ms / 1000;
            parsed.push({ time, text });
          });
        }
      }
    });

    return parsed.sort((a, b) => a.time - b.time);
  };

  useEffect(() => {
    if (!song) {
      setLyrics([]);
      setCurrentLyricIndex(-1);
      lastSongKeyRef.current = null;
      return;
    }
    
    const songKey = `${song.source}-${song.id}`;
    
    if (lastSongKeyRef.current === songKey) {
      return;
    }
    
    lastSongKeyRef.current = songKey;
    setLyrics([]);
    
    const fetchLyrics = async () => {
      try {
        const result = await onGetLyrics(song);
        if (result && lastSongKeyRef.current === songKey) {
          setLyrics(parseLyrics(result));
        }
      } catch (err) {
        console.error('获取歌词失败:', err);
      }
    };
    fetchLyrics();
  }, [song, onGetLyrics]);

  useEffect(() => {
    if (lyrics.length === 0 || isDragging) return;
    
    let index = -1;
    for (let i = 0; i < lyrics.length; i++) {
      if (lyrics[i].time <= currentTime) {
        index = i;
      } else {
        break;
      }
    }
    setCurrentLyricIndex(index);
  }, [currentTime, lyrics, isDragging]);

  if (!song) return null;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs}`;
  };

  const displayTime = isDragging ? dragTime : currentTime;

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * song.duration;
    onSeek(newTime);
  };

  const handleProgressDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const newTime = percentage * song.duration;
    setDragTime(newTime);
  };

  const handleDragStart = () => {
    setIsDragging(true);
    setDragTime(currentTime);
  };

  const handleDragEnd = () => {
    if (isDragging) {
      onSeek(dragTime);
      setIsDragging(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg dark:bg-gray-800 dark:border-gray-700 z-50"
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col gap-2">
            {lyrics.length > 0 && currentLyricIndex >= 0 && (
              <div className="text-center py-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {lyrics[currentLyricIndex].text}
                </p>
              </div>
            )}
            
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

              <div className="flex-1 mx-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-gray-500 dark:text-gray-400 min-w-[40px]">
                    {formatDuration(displayTime)}
                  </span>
                  <div 
                    className="flex-1 h-2 bg-gray-200 rounded-full dark:bg-gray-700 overflow-hidden cursor-pointer relative group"
                    onClick={handleProgressClick}
                    onMouseDown={handleDragStart}
                    onMouseMove={handleProgressDrag}
                  >
                    <div
                      className="h-full bg-blue-500 transition-all relative"
                      style={{ width: `${(displayTime / song.duration) * 100}%` }}
                    >
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md" />
                    </div>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400 min-w-[40px]">
                    {formatDuration(song.duration)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {playlist.length > 0 && (
                  <button
                    onClick={() => setShowPlaylist(true)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 relative"
                    title="播放列表"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {playlist.length}
                    </span>
                  </button>
                )}

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
      </div>

      {showPlaylist && (
        <PlaylistModal
          playlist={playlist}
          currentIndex={currentIndex}
          currentSong={song}
          isPlaying={isPlaying}
          onClose={() => setShowPlaylist(false)}
          onPlaySong={onPlaySong}
        />
      )}
    </>
  );
};

export default PlayerBar;

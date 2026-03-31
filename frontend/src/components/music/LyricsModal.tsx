import React, { useState, useEffect } from 'react';
import { Song } from '../../services/musicService';

interface LyricsModalProps {
  song: Song;
  onClose: () => void;
  onGetLyrics: (song: Song) => Promise<string | null>;
}

const LyricsModal: React.FC<LyricsModalProps> = ({ song, onClose, onGetLyrics }) => {
  const [lyrics, setLyrics] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLyrics = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await onGetLyrics(song);
        if (result) {
          setLyrics(result);
        } else {
          setError('暂无歌词');
        }
      } catch (err) {
        setError('获取歌词失败');
      } finally {
        setLoading(false);
      }
    };
    fetchLyrics();
  }, [song, onGetLyrics]);

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

  const renderLyrics = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-20 text-gray-500">
          {error}
        </div>
      );
    }

    const parsed = parseLyrics(lyrics);
    
    if (parsed.length > 0) {
      return (
        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {parsed.map((line, index) => (
            <p
              key={index}
              className="text-center text-gray-700 dark:text-gray-300 leading-relaxed"
            >
              {line.text}
            </p>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-2 max-h-[60vh] overflow-y-auto">
        {typeof lyrics === 'string' ? lyrics.split('\n').map((line, index) => (
          <p
            key={index}
            className="text-center text-gray-700 dark:text-gray-300 leading-relaxed"
          >
            {line || '\u00A0'}
          </p>
        )) : (
          <p className="text-center text-gray-500">暂无歌词</p>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden dark:bg-gray-800">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{song.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{song.artist}</p>
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
        
        <div className="p-6">
          {renderLyrics()}
        </div>
      </div>
    </div>
  );
};

export default LyricsModal;

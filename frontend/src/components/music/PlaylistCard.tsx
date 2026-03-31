import React from 'react';
import { Playlist } from '../../services/musicService';

interface PlaylistCardProps {
  playlist: Playlist;
  onClick: (playlist: Playlist) => void;
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist, onClick }) => {
  const formatPlayCount = (count: number) => {
    if (count >= 100000000) {
      return `${(count / 100000000).toFixed(1)}亿`;
    } else if (count >= 10000) {
      return `${(count / 10000).toFixed(1)}万`;
    }
    return count.toString();
  };

  const getSourceColor = (source: string) => {
    const colors: Record<string, string> = {
      netease: 'bg-red-500',
      qq: 'bg-green-500',
      kugou: 'bg-blue-500',
      kuwo: 'bg-orange-500',
      migu: 'bg-pink-500',
    };
    return colors[source] || 'bg-gray-500';
  };

  const getSourceName = (source: string) => {
    const names: Record<string, string> = {
      netease: '网易云',
      qq: 'QQ音乐',
      kugou: '酷狗',
      kuwo: '酷我',
      migu: '咪咕',
    };
    return names[source] || source;
  };

  return (
    <div
      onClick={() => onClick(playlist)}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer overflow-hidden group"
    >
      <div className="relative aspect-square">
        <img
          src={playlist.cover}
          alt={playlist.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23e5e7eb" width="100" height="100"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="40">🎵</text></svg>';
          }}
        />
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 text-xs text-white rounded ${getSourceColor(playlist.source)}`}>
            {getSourceName(playlist.source)}
          </span>
        </div>
        {playlist.play_count && (
          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
            ▶ {formatPlayCount(playlist.play_count)}
          </div>
        )}
      </div>
      <div className="p-3">
        <h4 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2 mb-1">
          {playlist.name}
        </h4>
        {playlist.creator && (
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {playlist.creator}
          </p>
        )}
        {playlist.track_count > 0 && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {playlist.track_count} 首歌曲
          </p>
        )}
      </div>
    </div>
  );
};

export default PlaylistCard;

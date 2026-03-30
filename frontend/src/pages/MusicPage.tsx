import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMusicData } from '../hooks/useMusicData';
import { Song } from '../services/musicService';
import SearchBar from '../components/music/SearchBar';
import SourceSelector from '../components/music/SourceSelector';
import SongCard from '../components/music/SongCard';
import PlayerBar from '../components/music/PlayerBar';
import LyricsModal from '../components/music/LyricsModal';
import ChangeSourceModal from '../components/music/ChangeSourceModal';

const MusicPage: React.FC = () => {
  const { t } = useTranslation();
  const {
    songs,
    loading,
    error,
    currentSong,
    isPlaying,
    selectedSources,
    favorites,
    search,
    playSong,
    togglePlay,
    stopSong,
    toggleSource,
    selectAllSources,
    clearAllSources,
    getDailyRecommendation,
    getLyrics,
    changeSource,
    isFavorite,
    toggleFavorite,
    downloadSong,
    downloadLyric,
    downloadCover,
  } = useMusicData();

  const [searchMode, setSearchMode] = useState<'song' | 'playlist'>('song');
  const [keyword, setKeyword] = useState('');
  const [lyricsSong, setLyricsSong] = useState<Song | null>(null);
  const [changeSourceSong, setChangeSourceSong] = useState<Song | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);

  const handleSearch = () => {
    search({ keyword });
  };

  const handleDailyRecommendation = async () => {
    await getDailyRecommendation();
  };

  const handleShowLyrics = (song: Song) => {
    setLyricsSong(song);
  };

  const handleChangeSource = (song: Song) => {
    setChangeSourceSong(song);
  };

  const handleDownloadSong = (song: Song) => {
    downloadSong(song);
  };

  const handleDownloadLyric = (song: Song) => {
    downloadLyric(song);
  };

  const handleDownloadCover = (song: Song) => {
    downloadCover(song);
  };

  const allSources = [
    { id: 'netease', label: t('music.sources.netease') },
    { id: 'qq', label: t('music.sources.qq') },
    { id: 'kugou', label: t('music.sources.kugou') },
    { id: 'kuwo', label: t('music.sources.kuwo') },
    { id: 'migu', label: t('music.sources.migu') },
    { id: 'fivesing', label: t('music.sources.fivesing') },
    { id: 'jamendo', label: t('music.sources.jamendo') },
    { id: 'joox', label: t('music.sources.joox') },
    { id: 'qianqian', label: t('music.sources.qianqian') },
    { id: 'soda', label: t('music.sources.soda') },
    { id: 'bilibili', label: t('music.sources.bilibili') },
  ];

  const displaySongs = showFavorites ? favorites : songs;

  return (
    <div className="pb-24">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {t('pages.music.title')}
        </h1>

        <div className="flex justify-center mb-4">
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setSearchMode('song')}
              className={`px-4 py-2 rounded-md transition-all ${
                searchMode === 'song'
                  ? 'bg-white dark:bg-gray-600 text-green-600 shadow'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              {t('pages.music.songSearch')}
            </button>
            <button
              onClick={() => setSearchMode('playlist')}
              className={`px-4 py-2 rounded-md transition-all ${
                searchMode === 'playlist'
                  ? 'bg-white dark:bg-gray-600 text-green-600 shadow'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              {t('pages.music.playlistSearch')}
            </button>
          </div>
        </div>

        <SearchBar
          keyword={keyword}
          onKeywordChange={setKeyword}
          onSearch={handleSearch}
          loading={loading}
        />

        <div className="flex justify-center gap-4 my-6">
          <button
            onClick={handleDailyRecommendation}
            className="px-6 py-3 bg-gradient-to-r from-pink-400 to-red-400 text-white rounded-full hover:shadow-lg transition-all"
          >
            🔥 {t('pages.music.dailyRecommendation')}
          </button>
          <button
            onClick={() => setShowFavorites(!showFavorites)}
            className={`px-6 py-3 rounded-full hover:shadow-lg transition-all ${
              showFavorites
                ? 'bg-gradient-to-r from-red-400 to-pink-400 text-white'
                : 'bg-gradient-to-r from-red-400 to-pink-400 text-white'
            }`}
          >
            {showFavorites ? `❤️ 收藏 (${favorites.length})` : `📁 ${t('pages.music.myPlaylist')}`}
          </button>
        </div>

        {!showFavorites && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                {t('pages.music.sourceSettings')}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={selectAllSources}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {t('pages.music.selectAll')}
                </button>
                <button
                  onClick={clearAllSources}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {t('pages.music.clearAll')}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {allSources.map((source) => (
                <SourceSelector
                  key={source.id}
                  source={source}
                  selected={selectedSources.includes(source.id)}
                  onToggle={() => toggleSource(source.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}

      {!loading && displaySongs.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              {showFavorites 
                ? `❤️ 收藏歌曲 (${favorites.length})`
                : `🎵 ${t('pages.music.foundSongs', { count: displaySongs.length })}`
              }
            </h3>
            {!showFavorites && (
              <div className="flex gap-2">
                <button className="px-4 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30">
                  ▶️ {t('pages.music.playAll')}
                </button>
                <button className="px-4 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30">
                  ⚙️ {t('pages.music.batchOperation')}
                </button>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {displaySongs.map((song, index) => (
              <SongCard
                key={`${song.source}-${song.id}-${index}`}
                song={song}
                onPlay={playSong}
                isPlaying={currentSong?.id === song.id && currentSong?.source === song.source && isPlaying}
                isFavorite={isFavorite(song)}
                onToggleFavorite={toggleFavorite}
                onChangeSource={handleChangeSource}
                onShowLyrics={handleShowLyrics}
                onDownloadSong={handleDownloadSong}
                onDownloadLyric={handleDownloadLyric}
                onDownloadCover={handleDownloadCover}
              />
            ))}
          </div>
        </div>
      )}

      {!loading && displaySongs.length === 0 && keyword === '' && !showFavorites && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
            />
          </svg>
          <p>{t('pages.music.searchPlaceholder')}</p>
        </div>
      )}

      {showFavorites && favorites.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <p>暂无收藏歌曲</p>
        </div>
      )}

      <PlayerBar
        song={currentSong}
        isPlaying={isPlaying}
        onTogglePlay={togglePlay}
        onClose={stopSong}
      />

      {lyricsSong && (
        <LyricsModal
          song={lyricsSong}
          onClose={() => setLyricsSong(null)}
          onGetLyrics={getLyrics}
        />
      )}

      {changeSourceSong && (
        <ChangeSourceModal
          song={changeSourceSong}
          onClose={() => setChangeSourceSong(null)}
          onChangeSource={changeSource}
          onPlay={playSong}
        />
      )}
    </div>
  );
};

export default MusicPage;

import { useState, useCallback, useRef, useEffect } from 'react';
import { musicService, Song, SearchParams, Playlist } from '../services/musicService';

const FAVORITES_KEY = 'music_favorites';

const getFavorites = (): Song[] => {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveFavorites = (favorites: Song[]) => {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
};

export const useMusicData = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedSources, setSelectedSources] = useState<string[]>([
    'netease', 'qq', 'kugou', 'kuwo'
  ]);
  const [favorites, setFavorites] = useState<Song[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.onended = () => {
        setIsPlaying(false);
      };
      audioRef.current.onerror = () => {
        setError('播放失败');
        setIsPlaying(false);
      };
    }
    setFavorites(getFavorites());
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const search = useCallback(async (params: SearchParams) => {
    if (!params.keyword.trim()) {
      setError('请输入搜索关键词');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await musicService.search({
        ...params,
        sources: selectedSources,
      });
      setSongs(result);
    } catch (err) {
      setError((err as Error).message);
      setSongs([]);
    } finally {
      setLoading(false);
    }
  }, [selectedSources]);

  const searchPlaylist = useCallback(async (params: SearchParams) => {
    if (!params.keyword.trim()) {
      setError('请输入搜索关键词');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await musicService.searchPlaylist({
        ...params,
        sources: selectedSources,
      });
      setPlaylists(result);
      return result;
    } catch (err) {
      setError((err as Error).message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [selectedSources]);

  const playSong = useCallback(async (song: Song) => {
    try {
      setError(null);
      const url = await musicService.getStreamUrl(
        song.id, 
        song.source, 
        song.name, 
        song.artist
      );
      if (url && audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
        setCurrentSong({ ...song, url });
        setIsPlaying(true);
      } else {
        setError('无法获取播放链接');
      }
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  const pauseSong = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const resumeSong = useCallback(() => {
    if (audioRef.current && currentSong) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [currentSong]);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pauseSong();
    } else {
      resumeSong();
    }
  }, [isPlaying, pauseSong, resumeSong]);

  const stopSong = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setCurrentSong(null);
    setIsPlaying(false);
  }, []);

  const toggleSource = useCallback((source: string) => {
    setSelectedSources(prev => 
      prev.includes(source) 
        ? prev.filter(s => s !== source)
        : [...prev, source]
    );
  }, []);

  const selectAllSources = useCallback(() => {
    setSelectedSources([
      'netease', 'qq', 'kugou', 'kuwo', 'migu', 
      'fivesing', 'jamendo', 'joox', 'qianqian', 'soda', 'bilibili'
    ]);
  }, []);

  const clearAllSources = useCallback(() => {
    setSelectedSources([]);
  }, []);

  const getDailyRecommendation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await musicService.getDailyRecommendation(selectedSources);
      setPlaylists(result);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [selectedSources]);

  const getLyrics = useCallback(async (song: Song) => {
    try {
      const lyrics = await musicService.getLyrics(song.id, song.source);
      return lyrics;
    } catch (err) {
      return null;
    }
  }, []);

  const getPlaylistSongs = useCallback(async (playlistId: string, source: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await musicService.getPlaylistSongs(playlistId, source);
      setSongs(result);
      return result;
    } catch (err) {
      setError((err as Error).message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const changeSource = useCallback(async (song: Song, targetSource?: string) => {
    try {
      const result = await musicService.changeSource(
        song.id, 
        song.source, 
        song.name, 
        song.artist, 
        song.duration,
        targetSource
      );
      return result;
    } catch (err) {
      setError((err as Error).message);
      return null;
    }
  }, []);

  const isFavorite = useCallback((song: Song) => {
    return favorites.some(f => f.id === song.id && f.source === song.source);
  }, [favorites]);

  const toggleFavorite = useCallback((song: Song) => {
    setFavorites(prev => {
      const exists = prev.some(f => f.id === song.id && f.source === song.source);
      let newFavorites: Song[];
      if (exists) {
        newFavorites = prev.filter(f => !(f.id === song.id && f.source === song.source));
      } else {
        newFavorites = [...prev, song];
      }
      saveFavorites(newFavorites);
      return newFavorites;
    });
  }, []);

  const downloadSong = useCallback(async (song: Song) => {
    try {
      const url = await musicService.getStreamUrl(song.id, song.source, song.name, song.artist);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${song.name} - ${song.artist}.mp3`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  const downloadLyric = useCallback(async (song: Song) => {
    try {
      const lyrics = await musicService.getLyrics(song.id, song.source);
      if (lyrics) {
        const blob = new Blob([lyrics], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${song.name} - ${song.artist}.lrc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        setError('暂无歌词');
      }
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  const downloadCover = useCallback(async (song: Song) => {
    try {
      if (song.cover) {
        const response = await fetch(song.cover);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${song.name} - ${song.artist}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        setError('暂无封面');
      }
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  return {
    songs,
    playlists,
    loading,
    error,
    currentSong,
    isPlaying,
    selectedSources,
    favorites,
    search,
    searchPlaylist,
    playSong,
    pauseSong,
    resumeSong,
    togglePlay,
    stopSong,
    toggleSource,
    selectAllSources,
    clearAllSources,
    getDailyRecommendation,
    getLyrics,
    getPlaylistSongs,
    changeSource,
    isFavorite,
    toggleFavorite,
    downloadSong,
    downloadLyric,
    downloadCover,
  };
};

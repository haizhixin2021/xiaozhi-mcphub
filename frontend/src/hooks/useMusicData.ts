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
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedSources, setSelectedSources] = useState<string[]>([
    'netease', 'qq', 'kugou', 'kuwo'
  ]);
  const [favorites, setFavorites] = useState<Song[]>([]);
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playlistRef = useRef<Song[]>([]);
  const currentIndexRef = useRef<number>(-1);

  useEffect(() => {
    playlistRef.current = playlist;
  }, [playlist]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  const playNextSong = useCallback(async () => {
    const currentPlaylist = playlistRef.current;
    const currentIdx = currentIndexRef.current;
    
    if (currentPlaylist.length === 0 || currentIdx >= currentPlaylist.length - 1) {
      return;
    }
    
    const nextIndex = currentIdx + 1;
    const nextSong = currentPlaylist[nextIndex];
    
    try {
      const url = await musicService.getStreamUrl(
        nextSong.id,
        nextSong.source,
        nextSong.name,
        nextSong.artist
      );
      if (url && audioRef.current) {
        audioRef.current.src = url;
        await audioRef.current.play();
        setCurrentSong({ ...nextSong, url });
        setCurrentIndex(nextIndex);
        setIsPlaying(true);
      }
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.onended = async () => {
        setIsPlaying(false);
        setCurrentTime(0);
        await playNextSong();
      };
      audioRef.current.onerror = () => {
        setError('播放失败');
        setIsPlaying(false);
      };
      audioRef.current.ontimeupdate = () => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
        }
      };
    }
    setFavorites(getFavorites());
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [playNextSong]);

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

  const playSong = useCallback(async (song: Song, songList?: Song[]) => {
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
        await audioRef.current.play();
        setCurrentSong({ ...song, url });
        setIsPlaying(true);
        
        if (songList) {
          setPlaylist(songList);
          const index = songList.findIndex(s => s.id === song.id && s.source === song.source);
          setCurrentIndex(index >= 0 ? index : -1);
        }
      } else {
        setError('无法获取播放链接');
      }
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  const playAll = useCallback(async (songList: Song[]) => {
    if (songList.length === 0) return;
    await playSong(songList[0], songList);
  }, [playSong]);

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

  const seekTo = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
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
      setPlaylists([]);
    } finally {
      setLoading(false);
    }
  }, [selectedSources]);

  const getLyrics = useCallback(async (song: Song): Promise<string | null> => {
    try {
      return await musicService.getLyrics(song.id, song.source);
    } catch (err) {
      console.error('获取歌词失败:', err);
      return null;
    }
  }, []);

  const getPlaylistSongs = useCallback(async (playlistId: string, source: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await musicService.getPlaylistSongs(playlistId, source);
      setSongs(result);
    } catch (err) {
      setError((err as Error).message);
      setSongs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const changeSource = useCallback(async (song: Song, targetSource?: string): Promise<Song | null> => {
    if (!targetSource) {
      return null;
    }
    try {
      setLoading(true);
      const results = await musicService.search({
        keyword: `${song.name} ${song.artist}`,
        sources: [targetSource],
      });
      
      if (results.length > 0) {
        return results[0];
      }
      return null;
    } catch (err) {
      setError((err as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const isFavorite = useCallback((song: Song): boolean => {
    return favorites.some(f => f.id === song.id && f.source === song.source);
  }, [favorites]);

  const toggleFavorite = useCallback((song: Song) => {
    setFavorites(prev => {
      const isExist = prev.some(f => f.id === song.id && f.source === song.source);
      let newFavorites: Song[];
      if (isExist) {
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
      const url = await musicService.getStreamUrl(
        song.id,
        song.source,
        song.name,
        song.artist
      );
      if (url) {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `${song.name} - ${song.artist}.mp3`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      } else {
        setError('无法获取下载链接');
      }
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  const downloadLyric = useCallback(async (song: Song) => {
    try {
      const lrc = await musicService.getLyrics(song.id, song.source);
      if (lrc) {
        const blob = new Blob([lrc], { type: 'text/plain' });
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
    currentTime,
    playlist,
    currentIndex,
    selectedSources,
    favorites,
    search,
    searchPlaylist,
    playSong,
    playAll,
    pauseSong,
    resumeSong,
    togglePlay,
    stopSong,
    seekTo,
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

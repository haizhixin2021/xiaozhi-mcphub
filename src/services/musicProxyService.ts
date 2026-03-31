import axios from 'axios';

interface MusicConfig {
  baseUrl: string;
}

const config: MusicConfig = {
  baseUrl: process.env.MUSIC_DL_URL || 'http://localhost:37778',
};

export interface Song {
  id: string;
  name: string;
  artist: string;
  album: string;
  cover: string;
  duration: number;
  source: string;
  size?: number;
  bitrate?: number;
  url?: string;
  link?: string;
  ext?: string;
  extra?: Record<string, string>;
  is_invalid?: boolean;
}

export interface Playlist {
  id: string;
  name: string;
  cover: string;
  track_count: number;
  play_count?: number;
  source: string;
  description?: string;
  creator?: string;
  link?: string;
}

export interface CookieData {
  netease?: string;
  qq?: string;
  kugou?: string;
  kuwo?: string;
  migu?: string;
  fivesing?: string;
  jamendo?: string;
  joox?: string;
  qianqian?: string;
  soda?: string;
  bilibili?: string;
}

interface SearchResponse {
  songs: Song[];
  playlists: Playlist[];
  type: string;
}

interface ApiResponse<T> {
  code: number;
  msg: string;
  data: T;
}

export class MusicProxyService {
  private client;

  constructor() {
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: 30000,
    });
  }

  async search(keyword: string, sources?: string[]): Promise<Song[]> {
    const params = new URLSearchParams();
    params.append('q', keyword);
    params.append('type', 'song');
    if (sources && sources.length > 0) {
      sources.forEach(s => params.append('sources', s));
    }
    const response = await this.client.get<ApiResponse<SearchResponse>>(`/api/v1/music/search?${params.toString()}`);
    return response.data.data?.songs || [];
  }

  async searchPlaylist(keyword: string, sources?: string[]): Promise<Playlist[]> {
    const params = new URLSearchParams();
    params.append('q', keyword);
    params.append('type', 'playlist');
    if (sources && sources.length > 0) {
      sources.forEach(s => params.append('sources', s));
    }
    const response = await this.client.get<ApiResponse<SearchResponse>>(`/api/v1/music/search?${params.toString()}`);
    return response.data.data?.playlists || [];
  }

  async getSongDetail(id: string, source: string, duration?: number): Promise<Song> {
    const params = new URLSearchParams({ id, source });
    if (duration) params.append('duration', duration.toString());
    const response = await this.client.get<ApiResponse<Song>>(`/api/v1/music/inspect?${params.toString()}`);
    return response.data.data;
  }

  async getSongUrl(id: string, source: string): Promise<{ url: string; size?: number; bitrate?: number }> {
    const params = new URLSearchParams({ id, source });
    const response = await this.client.get<ApiResponse<{ url: string; size?: number; bitrate?: number }>>(`/api/v1/music/url?${params.toString()}`);
    return response.data.data;
  }

  async getStreamUrl(id: string, source: string, name?: string, artist?: string): Promise<string> {
    const params = new URLSearchParams({ id, source });
    if (name) params.append('name', name);
    if (artist) params.append('artist', artist);
    return `${config.baseUrl}/api/v1/music/stream?${params.toString()}`;
  }

  async getLyrics(id: string, source: string): Promise<string> {
    const params = new URLSearchParams({ id, source });
    const response = await this.client.get<ApiResponse<{ lyric: string }>>(`/api/v1/music/lyric?${params.toString()}`);
    return response.data.data?.lyric || '';
  }

  async getDailyRecommendation(sources?: string[]): Promise<Playlist[]> {
    const params = new URLSearchParams();
    if (sources && sources.length > 0) {
      sources.forEach(s => params.append('sources', s));
    }
    const url = params.toString() ? `/api/v1/playlist/recommend?${params.toString()}` : '/api/v1/playlist/recommend';
    const response = await this.client.get<ApiResponse<Playlist[]>>(url);
    return response.data.data || [];
  }

  async getPlaylistSongs(playlistId: string, source: string): Promise<Song[]> {
    const params = new URLSearchParams({ id: playlistId, source });
    const response = await this.client.get<ApiResponse<Song[]>>(`/api/v1/playlist/detail?${params.toString()}`);
    return response.data.data || [];
  }

  async changeSource(name: string, artist: string, currentSource: string, duration?: number, targetSource?: string): Promise<Song | null> {
    const params = new URLSearchParams({ name, artist, source: currentSource });
    if (duration) params.append('duration', duration.toString());
    if (targetSource) params.append('target', targetSource);
    const response = await this.client.get<ApiResponse<Song>>(`/api/v1/music/switch?${params.toString()}`);
    return response.data.data;
  }

  async downloadLyric(id: string, source: string, name: string, artist: string): Promise<string> {
    const params = new URLSearchParams({ id, source, name, artist });
    return `${config.baseUrl}/api/v1/music/lyric/file?${params.toString()}`;
  }

  async downloadCover(coverUrl: string, name: string, artist: string): Promise<string> {
    const params = new URLSearchParams({ url: coverUrl, name, artist });
    return `${config.baseUrl}/api/v1/music/cover?${params.toString()}`;
  }

  async getCookies(): Promise<CookieData> {
    const response = await this.client.get<CookieData>('/api/v1/system/cookies');
    return response.data;
  }

  async setCookies(cookies: CookieData): Promise<void> {
    await this.client.post('/api/v1/system/cookies', cookies);
  }
}

export const musicProxyService = new MusicProxyService();

import { apiGet, apiPost } from '../utils/fetchInterceptor';

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

export interface SearchParams {
  keyword: string;
  sources?: string[];
}

export interface CookieData {
  netease: string;
  qq: string;
  kugou: string;
  kuwo: string;
  migu: string;
  fivesing: string;
  jamendo: string;
  joox: string;
  qianqian: string;
  soda: string;
  bilibili: string;
}

export const musicService = {
  async search(params: SearchParams): Promise<Song[]> {
    const queryParams = new URLSearchParams({ keyword: params.keyword });
    if (params.sources && params.sources.length > 0) {
      queryParams.append('sources', params.sources.join(','));
    }
    const response = await apiGet<{ success: boolean; data: Song[] }>(
      `/music/search?${queryParams.toString()}`
    );
    return response.data || [];
  },

  async searchPlaylist(params: SearchParams): Promise<Playlist[]> {
    const queryParams = new URLSearchParams({ keyword: params.keyword });
    if (params.sources && params.sources.length > 0) {
      queryParams.append('sources', params.sources.join(','));
    }
    const response = await apiGet<{ success: boolean; data: Playlist[] }>(
      `/music/playlist/search?${queryParams.toString()}`
    );
    return response.data || [];
  },

  async getStreamUrl(id: string, source: string, name: string, artist: string): Promise<string | null> {
    const queryParams = new URLSearchParams();
    if (name) queryParams.append('name', name);
    if (artist) queryParams.append('artist', artist);
    const queryString = queryParams.toString();
    const response = await apiGet<{ success: boolean; data: { url: string } }>(
      `/music/song/${source}/${id}/stream${queryString ? `?${queryString}` : ''}`
    );
    return response.data?.url || null;
  },

  async getLyrics(id: string, source: string): Promise<string | null> {
    const response = await apiGet<{ success: boolean; data: string }>(
      `/music/song/${source}/${id}/lyrics`
    );
    return response.data || null;
  },

  async getPlaylistSongs(playlistId: string, source: string): Promise<Song[]> {
    const response = await apiGet<{ success: boolean; data: Song[] }>(
      `/music/playlist/${source}/${playlistId}`
    );
    return response.data || [];
  },

  async getDailyRecommendation(sources: string[]): Promise<Playlist[]> {
    const queryParams = new URLSearchParams();
    if (sources && sources.length > 0) {
      queryParams.append('sources', sources.join(','));
    }
    const response = await apiGet<{ success: boolean; data: Playlist[] }>(
      `/music/daily?${queryParams.toString()}`
    );
    return response.data || [];
  },

  async getCookies(): Promise<CookieData> {
    const response = await apiGet<CookieData>(
      `/v1/system/cookies`
    );
    return response;
  },

  async setCookies(cookies: CookieData): Promise<void> {
    await apiPost<void>(
      `/v1/system/cookies`,
      cookies
    );
  },
};

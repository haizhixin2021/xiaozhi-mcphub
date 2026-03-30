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

  async getSongDetail(id: string, source: string, duration?: number): Promise<Song> {
    const queryParams = new URLSearchParams({});
    if (duration) queryParams.append('duration', duration.toString());
    const response = await apiGet<{ success: boolean; data: Song }>(
      `/music/song/${source}/${id}?${queryParams.toString()}`
    );
    return response.data;
  },

  async getSongUrl(id: string, source: string): Promise<{ url: string; size?: number; bitrate?: number }> {
    const response = await apiGet<{ success: boolean; data: { url: string; size?: number; bitrate?: number } }>(
      `/music/song/${source}/${id}/url`
    );
    return response.data;
  },

  async getStreamUrl(id: string, source: string, name?: string, artist?: string): Promise<string> {
    const queryParams = new URLSearchParams({});
    if (name) queryParams.append('name', name);
    if (artist) queryParams.append('artist', artist);
    const response = await apiGet<{ success: boolean; data: { url: string } }>(
      `/music/song/${source}/${id}/stream?${queryParams.toString()}`
    );
    return response.data.url;
  },

  async getLyrics(id: string, source: string): Promise<string> {
    const response = await apiGet<{ success: boolean; data: string }>(
      `/music/song/${source}/${id}/lyrics`
    );
    return response.data;
  },

  async getDailyRecommendation(sources?: string[]): Promise<Playlist[]> {
    const queryParams = new URLSearchParams();
    if (sources && sources.length > 0) {
      queryParams.append('sources', sources.join(','));
    }
    const url = sources ? `/music/daily?${queryParams.toString()}` : '/music/daily';
    const response = await apiGet<{ success: boolean; data: Playlist[] }>(url);
    return response.data || [];
  },

  async getPlaylistSongs(playlistId: string, source: string): Promise<Song[]> {
    const response = await apiGet<{ success: boolean; data: Song[] }>(
      `/music/playlist/${source}/${playlistId}`
    );
    return response.data || [];
  },

  async changeSource(id: string, source: string, name: string, artist: string, duration?: number, target?: string): Promise<Song | null> {
    const response = await apiPost<{ success: boolean; data: Song | null }>(
      `/music/song/${source}/${id}/change-source`,
      { name, artist, duration, target }
    );
    return response.data;
  },
};

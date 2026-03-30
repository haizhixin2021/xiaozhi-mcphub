import { Request, Response } from 'express';
import { musicProxyService } from '../services/musicProxyService.js';

export const searchMusic = async (req: Request, res: Response) => {
  try {
    const { keyword, sources } = req.query;
    if (!keyword) {
      return res.status(400).json({ success: false, message: 'Keyword is required' });
    }
    const sourcesArray = sources ? (sources as string).split(',') : undefined;
    const result = await musicProxyService.search(keyword as string, sourcesArray);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Search music error:', error);
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const searchPlaylist = async (req: Request, res: Response) => {
  try {
    const { keyword, sources } = req.query;
    if (!keyword) {
      return res.status(400).json({ success: false, message: 'Keyword is required' });
    }
    const sourcesArray = sources ? (sources as string).split(',') : undefined;
    const result = await musicProxyService.searchPlaylist(keyword as string, sourcesArray);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Search playlist error:', error);
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const getSongDetail = async (req: Request, res: Response) => {
  try {
    const { id, source } = req.params;
    const { duration } = req.query;
    const result = await musicProxyService.getSongDetail(id, source, duration ? parseInt(duration as string) : undefined);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Get song detail error:', error);
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const getSongUrl = async (req: Request, res: Response) => {
  try {
    const { id, source } = req.params;
    const result = await musicProxyService.getSongUrl(id, source);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Get song url error:', error);
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const getStreamUrl = async (req: Request, res: Response) => {
  try {
    const { id, source } = req.params;
    const { name, artist } = req.query;
    const url = await musicProxyService.getStreamUrl(id, source, name as string, artist as string);
    res.json({ success: true, data: { url } });
  } catch (error) {
    console.error('Get stream url error:', error);
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const getLyrics = async (req: Request, res: Response) => {
  try {
    const { id, source } = req.params;
    const result = await musicProxyService.getLyrics(id, source);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Get lyrics error:', error);
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const getDailyRecommendation = async (req: Request, res: Response) => {
  try {
    const { sources } = req.query;
    const sourcesArray = sources ? (sources as string).split(',') : undefined;
    const result = await musicProxyService.getDailyRecommendation(sourcesArray);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Get daily recommendation error:', error);
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const getPlaylistSongs = async (req: Request, res: Response) => {
  try {
    const { playlistId, source } = req.params;
    const result = await musicProxyService.getPlaylistSongs(playlistId, source);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Get playlist songs error:', error);
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const changeSource = async (req: Request, res: Response) => {
  try {
    const { id, source } = req.params;
    const { name, artist, duration, target } = req.body;
    const result = await musicProxyService.changeSource(
      name,
      artist,
      source,
      duration,
      target
    );
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Change source error:', error);
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

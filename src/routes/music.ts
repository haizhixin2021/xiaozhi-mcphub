import { Router } from 'express';
import {
  searchMusic,
  searchPlaylist,
  getSongDetail,
  getSongUrl,
  getStreamUrl,
  getLyrics,
  getDailyRecommendation,
  getPlaylistSongs,
  changeSource,
} from '../controllers/musicController.js';

const router = Router();

router.get('/search', searchMusic);
router.get('/playlist/search', searchPlaylist);
router.get('/song/:source/:id', getSongDetail);
router.get('/song/:source/:id/url', getSongUrl);
router.get('/song/:source/:id/stream', getStreamUrl);
router.get('/song/:source/:id/lyrics', getLyrics);
router.get('/daily', getDailyRecommendation);
router.get('/playlist/:source/:playlistId', getPlaylistSongs);
router.post('/song/:source/:id/change-source', changeSource);

export default router;

import { Router } from 'express';
import authMiddleware from '../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/:reportId', async (req, res, next) => {
  try {
    res.status(404).json({ error: 'Report not found' });
  } catch (error) {
    next(error);
  }
});

export default router;

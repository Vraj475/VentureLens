import { Router } from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import Session from '../models/Session.model.js';

const router = Router();

router.use(authMiddleware);

router.get('/list', async (req, res, next) => {
  try {
    const sessions = await Session.find({ uid: req.user.uid })
      .select('sessionId sessionTitle feasibilityScore createdAt')
      .sort({ createdAt: -1 });

    res.json(sessions);
  } catch (error) {
    next(error);
  }
});

router.delete('/all', async (req, res, next) => {
  try {
    await Session.deleteMany({ uid: req.user.uid });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { v4: uuidv4 } = await import('uuid');
    const session = await Session.create({
      sessionId: uuidv4(),
      uid: req.user.uid,
      status: 'idle',
    });
    res.json({ sessionId: session.sessionId });
  } catch (error) {
    next(error);
  }
});

export default router;

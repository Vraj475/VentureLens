import { Router } from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import User from '../models/User.model.js';
import Session from '../models/Session.model.js';

const router = Router();

router.use(authMiddleware);

router.get('/me', async (req, res, next) => {
  try {
    let user = await User.findOne({ uid: req.user.uid });

    if (!user) {
      user = await User.create({
        uid: req.user.uid,
        email: req.user.email,
        displayName: req.user.name || req.user.email?.split('@')[0],
        photoURL: req.user.picture || null,
      });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.post('/create', async (req, res, next) => {
  try {
    const { uid, email, displayName } = req.body;
    const user = await User.findOneAndUpdate(
      { uid: uid || req.user.uid },
      {
        uid: uid || req.user.uid,
        email: email || req.user.email,
        displayName: displayName || req.user.name,
        photoURL: req.user.picture || null,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.get('/sessions/list', async (req, res, next) => {
  try {
    const sessions = await Session.find({ uid: req.user.uid })
      .select('sessionId sessionTitle feasibilityScore createdAt')
      .sort({ createdAt: -1 });

    res.json(sessions);
  } catch (error) {
    next(error);
  }
});

router.delete('/sessions/all', async (req, res, next) => {
  try {
    await Session.deleteMany({ uid: req.user.uid });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;

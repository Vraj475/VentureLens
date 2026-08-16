const router = require('express').Router();
const User = require('../models/User.model');
const Session = require('../models/Session.model');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.get('/me', async (req, res, next) => {
  try {
    let user = await User.findOne({ uid: req.user.uid });
    if (!user) user = await User.create({ uid: req.user.uid, email: req.user.email || '', displayName: req.user.name || req.user.email || 'User', settings: { marketFocus: 'India', devilsAdvocate: true } });
    res.json(user);
  } catch (err) { next(err); }
});

router.post('/create', async (req, res, next) => {
  try {
    const { uid, email, displayName } = req.body;
    const user = await User.findOneAndUpdate({ uid: uid || req.user.uid }, { email, displayName, uid: uid || req.user.uid }, { upsert: true, new: true, setDefaultsOnInsert: true });
    res.json(user);
  } catch (err) { next(err); }
});

router.get('/sessions/list', async (req, res, next) => {
  try {
    const sessions = await Session.find({ uid: req.user.uid }).select('sessionId sessionTitle feasibilityScore status createdAt').sort({ createdAt: -1 }).limit(20);
    res.json(sessions);
  } catch (err) { next(err); }
});

router.delete('/sessions/all', async (req, res, next) => {
  try {
    const result = await Session.deleteMany({ uid: req.user.uid });
    res.json({ success: true, deleted: result.deletedCount });
  } catch (err) { next(err); }
});

module.exports = router;

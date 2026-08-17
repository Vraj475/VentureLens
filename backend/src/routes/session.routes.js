const router = require('express').Router();
const authMiddleware = require('../middleware/auth.middleware');
const ctrl = require('../controllers/session.controller');

router.use(authMiddleware);
router.post('/', ctrl.createSession);
router.get('/:id', ctrl.getSession);
router.post('/:id/idea', ctrl.submitIdea);
router.post('/:id/answer', ctrl.submitAnswer);
router.post('/:id/analyze', ctrl.runAnalysis);
router.post('/:id/challenge', ctrl.challengeSession);
router.post('/:id/report', ctrl.generateReport);
router.put('/:id/sync', ctrl.syncSession);
router.delete('/:id', ctrl.deleteSession);
router.post('/:id/report/stream', ctrl.streamReport);
router.post('/:id/chat', ctrl.chatFollowUp);

module.exports = router;

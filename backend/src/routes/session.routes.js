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

module.exports = router;

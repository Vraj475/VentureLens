const router = require('express').Router();
const Report = require('../models/Report.model');

router.get('/:reportId', async (req, res, next) => {
  try {
    const report = await Report.findOne({ reportId: req.params.reportId });
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json(report);
  } catch (err) { next(err); }
});

module.exports = router;

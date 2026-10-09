const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { getAll, update } = require('../controllers/settingsController');

router.get('/', protect, getAll);
router.put('/', protect, update);

module.exports = router;
const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { getAll, update, remove } = require('../controllers/contactController');

router.get('/', protect, getAll);
router.put('/:id', protect, update);
router.delete('/:id', protect, remove);

module.exports = router;
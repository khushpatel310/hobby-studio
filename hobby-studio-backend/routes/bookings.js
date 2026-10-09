const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { getAll, getOne, update, remove } = require('../controllers/bookingController');

router.get('/', protect, getAll);
router.get('/:id', protect, getOne);
router.put('/:id', protect, update);
router.delete('/:id', protect, remove);

module.exports = router;
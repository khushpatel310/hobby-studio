const router = require('express').Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { getAll, create, update, remove, reorder } = require('../controllers/galleryController');

router.get('/all', protect, getAll);
router.post('/', protect, upload.single('image'), create);
router.put('/:id', protect, upload.single('image'), update);
router.delete('/:id', protect, remove);
router.post('/reorder', protect, reorder);

module.exports = router;
const router = require('express').Router();
const { body } = require('express-validator');
const { create: createBooking } = require('../controllers/bookingController');
const { create: createReview, getApproved } = require('../controllers/reviewController');
const { create: createContact } = require('../controllers/contactController');
const { getPublic } = require('../controllers/galleryController');
const Settings = require('../models/Settings');

// Anti-bot Honeypot check
const checkHoneypot = (req, res, next) => {
  if (req.body.hp_website || req.body.bot_check) {
    return res.status(400).json({ success: false, error: 'Automated spam submission rejected.' });
  }
  next();
};

router.get('/gallery', getPublic);

router.get('/reviews', getApproved);

router.post('/reviews', [
  checkHoneypot,
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 80 }).withMessage('Name too long').escape(),
  body('text').trim().notEmpty().withMessage('Review text is required').isLength({ max: 2000 }).withMessage('Review exceeds maximum length').escape(),
  body('stars').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('service').trim().notEmpty().withMessage('Service type is required').isLength({ max: 100 }).escape(),
], createReview);

router.post('/bookings', [
  checkHoneypot,
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }).withMessage('Name too long').escape(),
  body('phone').trim().notEmpty().withMessage('Phone number is required').isLength({ min: 7, max: 25 }).withMessage('Invalid phone number format').escape(),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Valid email required').normalizeEmail().isLength({ max: 150 }),
  body('service').trim().notEmpty().withMessage('Service type is required').isLength({ max: 100 }).escape(),
  body('preferredDate').optional({ checkFalsy: true }).isISO8601().withMessage('Invalid date format'),
  body('message').optional({ checkFalsy: true }).trim().isLength({ max: 2000 }).withMessage('Message too long').escape(),
], createBooking);

router.post('/contact', [
  checkHoneypot,
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }).escape(),
  body('email').isEmail().withMessage('Valid email required').normalizeEmail().isLength({ max: 150 }),
  body('phone').optional({ checkFalsy: true }).trim().isLength({ max: 25 }).escape(),
  body('subject').optional({ checkFalsy: true }).trim().isLength({ max: 200 }).escape(),
  body('message').trim().notEmpty().withMessage('Message is required').isLength({ max: 2000 }).escape(),
], createContact);

router.get('/settings', async (req, res) => {
  try {
    const keys = ['studio_name', 'studio_tagline', 'studio_email', 'studio_phone', 'studio_address', 'business_hours', 'social_instagram', 'social_facebook', 'social_whatsapp'];
    const map = {};
    for (const key of keys) { map[key] = await Settings.get(key, ''); }
    res.json({ success: true, settings: map });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to load settings' });
  }
});

module.exports = router;
const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name:    { type: String, required: true, trim: true },
  email:   { type: String, required: true, lowercase: true },
  phone:   { type: String, trim: true, default: '' },
  subject: { type: String, default: '', trim: true },
  message: { type: String, required: true, trim: true },
  status:  { type: String, enum: ['unread', 'read', 'replied'], default: 'unread' },
  notes:   { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Contact', contactSchema);
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  name:          { type: String, required: true, trim: true },
  phone:         { type: String, required: true, trim: true },
  email:         { type: String, trim: true, default: '' },
  service:       { type: String, required: true },
  preferredDate: { type: Date },
  message:       { type: String, default: '', trim: true },
  status:        { type: String, enum: ['new', 'contacted', 'confirmed', 'completed', 'cancelled'], default: 'new' },
  source:        { type: String, default: 'website' },
  notes:         { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
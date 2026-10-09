const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  text:     { type: String, required: true, trim: true, maxlength: 2000 },
  stars:    { type: Number, required: true, min: 1, max: 5 },
  service:  { type: String, required: true },
  status:   { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
  featured: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
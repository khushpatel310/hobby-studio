const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  title:       { type: String, trim: true, default: '' },
  description: { type: String, trim: true, default: '' },
  image:       { type: String, required: true },
  thumbnail:   { type: String },
  category:    { type: String, enum: ['WEDDING', 'PRE-WED', 'STUDIO', 'COUPLE', 'OUTDOOR', 'BIRTHDAY', 'MODEL', 'OTHER'], required: true },
  featured:    { type: Boolean, default: false },
  order:       { type: Number, default: 0 },
  tags:        [{ type: String, trim: true }],
  fileSize:    { type: Number },
}, { timestamps: true });

module.exports = mongoose.model('Gallery', gallerySchema);
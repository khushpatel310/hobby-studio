const Gallery = require('../models/Gallery');
const fs = require('fs');
const path = require('path');

exports.getPublic = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      return res.json({ images: [] });
    }
    const { category } = req.query;
    const filter = {};
    if (category && category !== 'ALL') filter.category = category;
    const images = await Gallery.find(filter).sort({ order: 1, createdAt: -1 });
    res.json({ images });
  } catch (err) { res.json({ images: [] }); }
};

exports.getAll = async (req, res) => {
  try {
    const images = await Gallery.find().sort({ order: 1, createdAt: -1 });
    res.json({ images });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch gallery' }); }
};

exports.create = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Image file is required' });
    const image = `/uploads/${req.file.filename}`;
    const gallery = await Gallery.create({
      title: req.body.title || '', description: req.body.description || '',
      image, thumbnail: image, category: req.body.category || 'OTHER',
      featured: req.body.featured === 'true', order: parseInt(req.body.order) || 0,
      tags: req.body.tags ? req.body.tags.split(',').map(t => t.trim()) : [],
      fileSize: req.file.size,
    });
    res.status(201).json({ gallery, message: 'Image added to gallery' });
  } catch (err) { res.status(500).json({ error: 'Failed to upload image' }); }
};

exports.update = async (req, res) => {
  try {
    const update = {};
    if (req.body.title !== undefined) update.title = req.body.title;
    if (req.body.description !== undefined) update.description = req.body.description;
    if (req.body.category !== undefined) update.category = req.body.category;
    if (req.body.featured !== undefined) update.featured = req.body.featured;
    if (req.body.order !== undefined) update.order = parseInt(req.body.order);
    if (req.body.tags !== undefined) update.tags = req.body.tags.split(',').map(t => t.trim());
    if (req.file) {
      const existing = await Gallery.findById(req.params.id);
      if (existing && existing.image) {
        const cleanPath = existing.image.replace(/^\/+/, '');
        const oldPath = path.join(__dirname, '..', cleanPath);
        if (fs.existsSync(oldPath)) {
          try { fs.unlinkSync(oldPath); } catch (e) { console.error('Failed to unlink old image:', e.message); }
        }
      }
      update.image = `/uploads/${req.file.filename}`;
      update.thumbnail = update.image;
      update.fileSize = req.file.size;
    }
    const gallery = await Gallery.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!gallery) return res.status(404).json({ success: false, error: 'Image not found' });
    res.json({ success: true, gallery });
  } catch (err) {
    console.error('update gallery error:', err);
    res.status(500).json({ success: false, error: 'Failed to update gallery image' });
  }
};

exports.remove = async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) return res.status(404).json({ success: false, error: 'Image not found' });
    if (gallery.image) {
      const cleanPath = gallery.image.replace(/^\/+/, '');
      const filePath = path.join(__dirname, '..', cleanPath);
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (e) { console.error('Failed to unlink image file:', e.message); }
      }
    }
    await Gallery.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Image deleted from gallery' });
  } catch (err) {
    console.error('delete gallery error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete image' });
  }
};

exports.reorder = async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) return res.status(400).json({ error: 'items array required' });
    for (const item of items) { await Gallery.findByIdAndUpdate(item.id, { order: item.order }); }
    res.json({ message: 'Gallery reordered' });
  } catch (err) { res.status(500).json({ error: 'Failed to reorder gallery' }); }
};
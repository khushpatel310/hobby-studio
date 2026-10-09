const Review = require('../models/Review');
const { validationResult } = require('express-validator');

// Get all approved reviews for public display
exports.getApproved = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      return res.json({ success: true, reviews: [], total: 0 });
    }
    const reviews = await Review.find({ status: 'approved' })
      .sort({ featured: -1, createdAt: -1 })
      .limit(50);
    res.json({ success: true, reviews, total: reviews.length });
  } catch (err) {
    console.error('getApproved error:', err);
    res.json({ success: true, reviews: [], total: 0 });
  }
};

// Get all reviews (with filters and pagination) for Admin
exports.getAll = async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const filter = status && status !== 'all' ? { status } : {};
    const reviews = await Review.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Review.countDocuments(filter);
    res.json({ success: true, reviews, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('getAll reviews error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch reviews' });
  }
};

// Create a new review from public form
exports.create = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: errors.array()[0].msg });
    }

    const { name, text, stars, service } = req.body;

    const review = await Review.create({
      name: name.trim(),
      text: text.trim(),
      stars: Math.min(5, Math.max(1, Number(stars) || 5)),
      service: service ? service.trim() : 'Photography',
      status: 'approved', // Auto-approved so users immediately see their feedback; Admin can moderate/reject anytime
    });

    console.log(`✓ New review submitted by ${review.name} (${review.stars}★)`);

    res.status(201).json({
      success: true,
      review,
      message: 'Thank you! Your review has been published successfully.',
    });
  } catch (err) {
    console.error('create review error:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to submit review' });
  }
};

// Get Single Review for Admin
exports.getOne = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }
    res.json({ success: true, review });
  } catch (err) {
    console.error('getOne review error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch review' });
  }
};

// Update review (all fields: name, text, stars, service, status, featured)
exports.update = async (req, res) => {
  try {
    const { name, text, stars, service, status, featured } = req.body;
    const update = {};

    if (name !== undefined) update.name = name.trim();
    if (text !== undefined) update.text = text.trim();
    if (stars !== undefined) update.stars = Math.min(5, Math.max(1, Number(stars) || 5));
    if (service !== undefined) update.service = service.trim();
    if (status !== undefined) update.status = status;
    if (featured !== undefined) update.featured = featured;

    const review = await Review.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });

    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }

    res.json({
      success: true,
      review,
      message: 'Review updated successfully',
    });
  } catch (err) {
    console.error('update review error:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to update review',
    });
  }
};

// Delete review
exports.remove = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ success: false, error: 'Review not found' });
    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (err) {
    console.error('remove review error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete review' });
  }
};
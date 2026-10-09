const Booking = require('../models/Booking');
const { validationResult } = require('express-validator');
const { sendNewBookingNotification, sendBookingConfirmationToClient } = require('../config/email');

// ==========================================
// Get All Bookings
// ==========================================

exports.getAll = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const filter = status && status !== 'all'
      ? { status }
      : {};

    const bookings = await Booking.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(filter);

    res.json({
      bookings,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'Failed to fetch bookings',
    });
  }
};

// ==========================================
// Get Single Booking
// ==========================================

exports.getOne = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        error: 'Booking not found',
      });
    }

    res.json({ booking });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'Failed to fetch booking',
    });
  }
};

// ==========================================
// Create Booking
// ==========================================

exports.create = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        error: 'Database is temporarily unavailable. Please call us directly at +91 98790 81558 or try again in a moment.',
      });
    }

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: errors.array()[0].msg,
      });
    }

    let preferredDate = null;
    if (req.body.preferredDate && typeof req.body.preferredDate === 'string' && req.body.preferredDate.trim() !== '') {
      const d = new Date(req.body.preferredDate);
      if (!isNaN(d.getTime())) {
        preferredDate = d;
      }
    }

    const booking = await Booking.create({
      name: req.body.name.trim(),
      phone: req.body.phone.trim(),
      email: req.body.email ? req.body.email.trim() : '',
      service: req.body.service ? req.body.service.trim() : 'Wedding Photography',
      preferredDate,
      message: req.body.message ? req.body.message.trim() : '',
      status: 'new',
    });

    console.log(`✓ New booking created for ${booking.name} (${booking.service})`);

    // Send response immediately
    res.status(201).json({
      success: true,
      booking,
      message: 'Booking enquiry received! We will contact you within 24 hours.',
    });

    // Send admin notification in background
    sendNewBookingNotification(booking)
      .catch(err => {
        console.error('Admin email notification failed:', err.message);
      });

    // Send customer confirmation in background if email provided
    if (booking.email) {
      sendBookingConfirmationToClient(booking)
        .catch(err => {
          console.error('Client email confirmation failed:', err.message);
        });
    }

  } catch (err) {
    console.error('create booking error:', err);

    res.status(500).json({
      success: false,
      error: err.message || 'Failed to submit booking',
    });
  }
};

// ==========================================
// Update Booking
// ==========================================

exports.update = async (req, res) => {
  try {
    const { name, phone, email, service, preferredDate, message, status, notes } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (phone !== undefined) updateData.phone = phone.trim();
    if (email !== undefined) updateData.email = email.trim();
    if (service !== undefined) updateData.service = service.trim();
    if (message !== undefined) updateData.message = message.trim();
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes.trim();

    if (preferredDate !== undefined) {
      if (preferredDate && typeof preferredDate === 'string' && preferredDate.trim() !== '') {
        const d = new Date(preferredDate);
        if (!isNaN(d.getTime())) updateData.preferredDate = d;
      } else {
        updateData.preferredDate = null;
      }
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found',
      });
    }

    res.json({
      success: true,
      booking,
      message: 'Booking updated successfully',
    });

  } catch (err) {
    console.error('update booking error:', err);

    res.status(500).json({
      success: false,
      error: err.message || 'Failed to update booking',
    });
  }
};

// ==========================================
// Delete Booking
// ==========================================

exports.remove = async (req, res) => {
  try {

    const booking = await Booking.findByIdAndDelete(req.params.id);

    if (!booking) {
      return res.status(404).json({
        error: 'Booking not found',
      });
    }

    res.json({
      message: 'Booking deleted successfully.',
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: 'Failed to delete booking',
    });
  }
};
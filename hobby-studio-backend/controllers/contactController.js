const Contact = require('../models/Contact');
const { validationResult } = require('express-validator');

exports.getAll = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = status && status !== 'all' ? { status } : {};
    const contacts = await Contact.find(filter).sort({ createdAt: -1 })
      .skip((page - 1) * limit).limit(parseInt(limit));
    const total = await Contact.countDocuments(filter);
    res.json({ contacts, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch messages' }); }
};

exports.create = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
    const contact = await Contact.create({
      name: req.body.name, email: req.body.email, phone: req.body.phone || '',
      subject: req.body.subject || '', message: req.body.message,
    });
    res.status(201).json({ contact, message: 'Message received! We will get back to you shortly.' });
  } catch (err) { res.status(500).json({ error: 'Failed to send message' }); }
};

exports.update = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const contact = await Contact.findByIdAndUpdate(req.params.id,
      { ...(status && { status }), ...(notes !== undefined && { notes }) }, { new: true });
    if (!contact) return res.status(404).json({ error: 'Message not found' });
    res.json({ contact });
  } catch (err) { res.status(500).json({ error: 'Failed to update message' }); }
};

exports.remove = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) return res.status(404).json({ error: 'Message not found' });
    res.json({ message: 'Message deleted' });
  } catch (err) { res.status(500).json({ error: 'Failed to delete message' }); }
};
const Settings = require('../models/Settings');

exports.getAll = async (req, res) => {
  try {
    const settings = await Settings.find().lean();
    const map = {};
    settings.forEach(s => { map[s.key] = s.value; });
    res.json({ settings: map });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch settings' }); }
};

exports.update = async (req, res) => {
  try {
    const updates = req.body;
    for (const [key, value] of Object.entries(updates)) {
      await Settings.set(key, value);
    }
    res.json({ message: 'Settings updated', settings: req.body });
  } catch (err) { res.status(500).json({ error: 'Failed to update settings' }); }
};
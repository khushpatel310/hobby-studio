require('dotenv').config();
const connectDB = require('./config/db');
const Admin = require('./models/Admin');
const Settings = require('./models/Settings');

const seed = async () => {
  await connectDB();

  const email = process.env.ADMIN_EMAIL || 'admin@hobbystudio.com';
  const exists = await Admin.findOne({ email });
  if (!exists) {
    await Admin.create({
      name: 'Studio Admin',
      email,
      password: process.env.ADMIN_PASSWORD || 'Hobby@Studio#2026',
      role: 'superadmin',
    });
    console.log('✓ Admin created:', email);
  } else {
    console.log('• Admin already exists:', email);
  }

  const defaults = {
    studio_name: 'Hobby Studio',
    studio_tagline: 'Wedding, Pre-Wedding & Portrait Photography',
    studio_email: 'hobbystudiophotography@gmail.com',
    studio_phone: '+91 98790 81558',
    studio_address: 'Visnagar, Gujarat, India',
    business_hours: 'Mon – Sat, 8:00 am – 7:30 pm',
    social_instagram: 'https://www.instagram.com/hobby_studio_visnagar',
    social_facebook: 'https://www.facebook.com/share/1EeqWA2Lxg/',
    social_whatsapp: 'https://wa.me/919879081558',
    seo_title: 'Hobby Studio — Professional Photography in Visnagar, Gujarat',
    seo_description: 'Professional wedding, pre-wedding & studio portrait photography in Visnagar, Gujarat.',
  };

  for (const [key, value] of Object.entries(defaults)) {
    await Settings.set(key, value);
  }
  console.log('✓ Default settings saved');
  console.log('\n  ─── Seed Complete ───\n');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
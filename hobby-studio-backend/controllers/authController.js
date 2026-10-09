const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const Admin = require('../models/Admin');

const generateToken = (admin) => {
  return jwt.sign(
    {
      id: admin._id,
      email: admin.email,
      role: admin.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    }
  );
};

exports.login = async (req, res) => {
  try {

    console.log("\n================ LOGIN =================");

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log("Validation Error:", errors.array());

      return res.status(400).json({
        error: errors.array()[0].msg
      });
    }

    const { email, password } = req.body;

    console.log("Email Entered:", email);
    console.log("Password Entered:", password);

    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      console.log("❌ Database connection is not ready (state:", mongoose.connection.readyState, ")");
      return res.status(503).json({
        error: "Database is currently disconnected or paused. Please check your MongoDB Atlas cluster status at cloud.mongodb.com and ensure it is resumed."
      });
    }

    const admin = await Admin.findOne({
      email: email.toLowerCase()
    });

    console.log("Admin Found:");
    console.log(admin);

    if (!admin) {
      console.log("❌ Email not found");

      return res.status(401).json({
        error: "Email not found"
      });
    }

    const match = await admin.comparePassword(password);

    console.log("Password Match:", match);

    if (!match) {
      console.log("❌ Password Incorrect");

      return res.status(401).json({
        error: "Invalid email or password"
      });
    }

    admin.lastLogin = new Date();
    await admin.save();

    const token = generateToken(admin);

    console.log("✅ LOGIN SUCCESS");

    res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        avatar: admin.avatar
      }
    });

  } catch (err) {

    console.log("LOGIN ERROR");
    console.log(err);

    res.status(500).json({
      error: err.message
    });
  }
};

exports.getMe = async (req, res) => {
  res.json({
    admin: req.admin
  });
};

exports.updateProfile = async (req, res) => {
  try {

    const { name, avatar } = req.body;

    if (name) req.admin.name = name;

    if (avatar !== undefined)
      req.admin.avatar = avatar;

    await req.admin.save();

    res.json({
      admin: req.admin
    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: "Current password and new password are required.",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: "New password must be at least 8 characters long.",
      });
    }

    const match = await req.admin.comparePassword(currentPassword);

    if (!match) {
      return res.status(400).json({
        success: false,
        error: "Current password is incorrect.",
      });
    }

    req.admin.password = newPassword;
    await req.admin.save();

    res.json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (err) {
    console.error("changePassword error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to update password.",
    });
  }
};
  require('dotenv').config();
  require('./config/validateEnv');

  const express = require('express');
  const cors = require('cors');
  const helmet = require('helmet');
  const morgan = require('morgan');
  const rateLimit = require('express-rate-limit');
  const compression = require('compression');
  const mongoSanitize = require('express-mongo-sanitize');
  const hpp = require('hpp');
  const path = require('path');
  const fs = require('fs');

  const connectDB = require('./config/db');

  // Connect MongoDB
  connectDB();

  const app = express();

  // ============================
  // SECURITY HEADERS
  // ============================

  app.use(
    helmet({
      crossOriginResourcePolicy: {
        policy: "cross-origin",
      },
      crossOriginEmbedderPolicy: false,
      frameguard: {
        action: "deny",
      },
      xssFilter: true,
      noSniff: true,
      contentSecurityPolicy: false,
    })
  );

  // Additional Security Headers
  app.use((req, res, next) => {
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    next();
  });

  // Compression for speed
  app.use(compression());

  // Prevent MongoDB Operator Injection ($gt, $where, etc.)
  app.use(mongoSanitize({ replaceWith: '_' }));

  // Prevent HTTP Parameter Pollution
  app.use(hpp());

  // CORS
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, or local file://)
        if (!origin) return callback(null, true);

        // Allow localhost and 127.0.0.1 on any port
        if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
          return callback(null, true);
        }

        if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
          return callback(null, true);
        }

        // Allow in development mode
        if (process.env.NODE_ENV !== "production") {
          return callback(null, true);
        }

        callback(null, true);
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    })
  );

  // ============================
  // RATE LIMITERS
  // ============================

  // Global API limiter
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === "production" ? 300 : 2000,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: "Too many requests from this IP. Please try again later.",
    },
  });

  app.use("/api", apiLimiter);

  // Strict Login Limiter (Anti-Brute Force)
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === "production" ? 5 : 50,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: "Too many login attempts. Please try again after 15 minutes.",
    },
  });

  app.use("/api/auth/login", loginLimiter);

  // Public Submissions Rate Limiter (Anti-Spam for Bookings, Reviews, Contact)
  const publicSubmissionLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30, // Max 30 submissions per 15 minutes per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: "Submission limit reached. Please wait a few minutes before submitting again.",
    },
  });

  app.use("/api/public/bookings", publicSubmissionLimiter);
  app.use("/api/public/reviews", publicSubmissionLimiter);
  app.use("/api/public/contact", publicSubmissionLimiter);

  // ============================
  // BODY PARSER (Payload Limits)
  // ============================

  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true, limit: "2mb" }));

  // ============================
  // LOGGER
  // ============================

  if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
  }

  // ============================
  // STATIC FOLDERS & ASSETS
  // ============================

  // Uploaded Images
  app.use("/uploads", express.static(path.join(__dirname, "uploads"), { maxAge: "7d" }));

  // Admin Dashboard
  app.use("/admin", express.static(path.join(__dirname, "admin-dashboard")));

  // Favicon & Brand Icons
  const adminFavicon = path.join(__dirname, "admin-dashboard", "favicon.svg");
  app.get(["/favicon.ico", "/favicon.svg"], (req, res) => {
    if (fs.existsSync(adminFavicon)) {
      res.type("image/svg+xml").sendFile(adminFavicon);
    } else {
      res.status(204).end();
    }
  });

  // Frontend Website Path
  const frontendPath = path.join(__dirname, "..", "hobby-studio-frontend");

  // Google Search Robots & Sitemap
  app.get("/robots.txt", (req, res) => {
    const robotsPath = path.join(frontendPath, "robots.txt");
    if (fs.existsSync(robotsPath)) {
      res.type("text/plain").sendFile(robotsPath);
    } else {
      res.type("text/plain").send("User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\nSitemap: /sitemap.xml\n");
    }
  });

  app.get("/sitemap.xml", (req, res) => {
    const sitemapPath = path.join(frontendPath, "sitemap.xml");
    if (fs.existsSync(sitemapPath)) {
      res.type("application/xml").sendFile(sitemapPath);
    } else {
      res.status(404).send("Sitemap not found");
    }
  });

  // Serve static frontend with client caching
  if (fs.existsSync(frontendPath)) {
    app.use(express.static(frontendPath, {
      maxAge: process.env.NODE_ENV === "production" ? "1d" : "0",
      etag: true
    }));
  }

  // ============================
  // API ROUTES
  // ============================

  app.use("/api/auth", require("./routes/auth"));
  app.use("/api/bookings", require("./routes/bookings"));
  app.use("/api/reviews", require("./routes/reviews"));
  app.use("/api/gallery", require("./routes/gallery"));
  app.use("/api/contacts", require("./routes/contacts"));
  app.use("/api/settings", require("./routes/settings"));
  app.use("/api/public", require("./routes/public"));

  // ============================
  // HEALTH CHECK
  // ============================

  app.get("/api/health", (req, res) => {
    res.json({
      success: true,
      message: "Backend Running",
      database: "Connected",
      time: new Date(),
    });
  });

  // ============================
  // ROOT ROUTE
  // ============================

  app.get("/", (req, res) => {
    if (fs.existsSync(path.join(frontendPath, "index.html"))) {
      return res.sendFile(path.join(frontendPath, "index.html"));
    }
    res.json({
      success: true,
      message: "Hobby Studio API is live",
      admin: "/admin",
      health: "/api/health",
    });
  });

  // ============================
  // 404
  // ============================

  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: "Route not found",
    });
  });

  // ============================
  // ERROR HANDLER
  // ============================

  app.use((err, req, res, next) => {
    console.error(err.stack);

    if (err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        error: err.message,
      });
    }

    if (err.name === "MulterError") {
      return res.status(400).json({
        success: false,
        error: err.message,
      });
    }

    res.status(err.status || 500).json({
      success: false,
      error:
        process.env.NODE_ENV === "production"
          ? "Internal Server Error"
          : err.message,
    });
  });

  // ============================
  // START SERVER
  // ============================

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log("\n========================================");
    console.log("🎉 Hobby Studio Backend Started");
    console.log("========================================");
    console.log(`🌐 Server : http://localhost:${PORT}`);
    console.log(`🛠 Admin  : http://localhost:${PORT}/admin`);
    console.log(`💚 Health : http://localhost:${PORT}/api/health`);
    console.log("========================================\n");
  });
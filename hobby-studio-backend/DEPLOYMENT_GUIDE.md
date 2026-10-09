# 🚀 Hobby Studio — Production Deployment Guide

This guide provides step-by-step instructions for deploying the **Hobby Studio** website, admin panel, and backend to production.

---

## 📋 Pre-Deployment Checklist

1. **MongoDB Atlas Database**:
   - Go to [MongoDB Atlas](https://cloud.mongodb.com).
   - Under **Security** -> **Network Access**, ensure **`0.0.0.0/0`** (Allow access from anywhere) is added so your cloud server can connect to the database.
   - Copy your connection string (`mongodb+srv://...`).

2. **Environment Variables**:
   Prepare the following variables in your hosting provider's dashboard:
   ```env
   NODE_ENV=production
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.yuw8lte.mongodb.net/hobby-studio?retryWrites=true&w=majority
   JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=https://your-domain.com
   MAX_FILE_SIZE=10485760
   UPLOAD_PATH=uploads
   ```
   *(Optional email notifications via Gmail / SMTP)*:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=hobbystudiophotography@gmail.com
   SMTP_PASS=your_gmail_16_digit_app_password
   NOTIFICATION_EMAIL=hobbystudiophotography@gmail.com
   ```

---

## 🌐 Option 1: Full-Stack Single-Server Deployment (Recommended — Render / Railway / VPS)

Deploy the entire app (Frontend Website, Admin Dashboard, and REST API) from a single repository.

### Deploying on [Render.com](https://render.com)
1. Push your code to a Git repository (GitHub / GitLab).
2. On Render, click **New +** -> **Web Service**.
3. Select your repository.
4. Set the following build settings:
   - **Root Directory**: `hobby-studio-backend` (or leave empty if repo root)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. In the **Environment Variables** tab, add the environment variables listed above.
6. Click **Create Web Service**.

Once deployed, you will get a single live URL (e.g. `https://hobby-studio.onrender.com`):
- **Client Website**: `https://hobby-studio.onrender.com/`
- **Admin Dashboard**: `https://hobby-studio.onrender.com/admin/`
- **Health Check**: `https://hobby-studio.onrender.com/api/health`

---

## 🌐 Option 2: Decoupled Deployment (Frontend on Vercel / Netlify + Backend on Render)

If you prefer hosting the client-facing frontend on Vercel or Netlify:

1. **Deploy Backend first**:
   - Follow Option 1 above to deploy `hobby-studio-backend`.
   - Note down your backend URL (e.g. `https://hobby-studio-api.onrender.com`).

2. **Configure Frontend**:
   - In `hobby-studio-frontend/index.html`, locate the `PRODUCTION_BACKEND_URL` placeholder near line 3195:
     ```javascript
     window.PRODUCTION_BACKEND_URL = 'https://hobby-studio-api.onrender.com';
     ```
3. **Deploy Frontend on Vercel / Netlify**:
   - Drag and drop the `hobby-studio-frontend` folder or connect via GitHub.
   - Set publish directory to `.` (root).

---

## 🔐 Default Admin Credentials

After connecting your production database, you can sign in to the Admin Dashboard (`/admin/`):
- **Email**: `admin@hobbystudio.com`
- **Password**: `Hobby@Studio#2026`

> **Note**: You can change your password anytime directly from the **Settings** (`/admin/settings.html`) tab in the admin panel.

---

## 🛡️ Built-in Security Features

- **Anti-Spam Honeypots**: Forms automatically reject automated bot submissions.
- **Rate Limiting**: Brute-force protection on `/api/auth/login` and submission flooding limits on public endpoints.
- **Input Sanitization**: HTML escaping against XSS and Mongo sanitize against NoSQL injection.
- **Upload Hardening**: Cryptographic random filenames, strict MIME & extension verification, and multi-extension blocking.
- **Auto-Reconnect**: Mongoose database lifecycle auto-reconnects on network disruptions.

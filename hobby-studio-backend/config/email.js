const nodemailer = require("nodemailer");

// ==========================================
// Create Transporter
// ==========================================

let transporter = null;

const studioEmail = process.env.EMAIL_USER || 'hobbystudiophotography@gmail.com';

if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

/**
 * Send Email
 * @param {Object} options
 * @param {string} options.to
 * @param {string} options.subject
 * @param {string} options.html
 */
const sendEmail = async ({ to, subject, html }) => {
  if (!transporter) {
    console.log("📧 Email service is not configured.");
    return false;
  }

  try {
    await transporter.sendMail({
      from: `"Hobby Studio" <${studioEmail}>`,
      to,
      subject,
      html,
    });

    console.log(`✅ Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error("❌ Email Error:", error.message);
    return false;
  }
};

/**
 * Notify Studio Admin About New Booking
 */
const sendNewBookingNotification = async (booking) => {
  const recipient = process.env.NOTIFICATION_EMAIL || process.env.EMAIL_USER || 'hobbystudiophotography@gmail.com';
  
  const formattedDate = booking.preferredDate 
    ? new Date(booking.preferredDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : 'Not Specified';

  return sendEmail({
    to: recipient,
    subject: `📸 New Booking Inquiry - ${booking.name} (${booking.service})`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e0d8c8;border-radius:12px;background:#fcfbf8;">
        <h2 style="color:#b8892f;margin-top:0;">📸 New Booking Inquiry Received</h2>
        <p style="color:#555;">A new booking request has been submitted through the Hobby Studio website.</p>
        
        <table style="width:100%;border-collapse:collapse;margin:20px 0;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
          <tr style="border-bottom:1px solid #eee;"><td style="padding:12px;color:#888;width:35%;"><strong>Client Name</strong></td><td style="padding:12px;font-weight:bold;color:#222;">${booking.name}</td></tr>
          <tr style="border-bottom:1px solid #eee;"><td style="padding:12px;color:#888;"><strong>Phone Number</strong></td><td style="padding:12px;color:#222;"><a href="tel:${booking.phone}" style="color:#b8892f;text-decoration:none;font-weight:bold;">${booking.phone}</a></td></tr>
          <tr style="border-bottom:1px solid #eee;"><td style="padding:12px;color:#888;"><strong>Email Address</strong></td><td style="padding:12px;color:#222;">${booking.email ? `<a href="mailto:${booking.email}" style="color:#b8892f;text-decoration:none;">${booking.email}</a>` : '—'}</td></tr>
          <tr style="border-bottom:1px solid #eee;"><td style="padding:12px;color:#888;"><strong>Service Type</strong></td><td style="padding:12px;color:#222;font-weight:bold;">${booking.service}</td></tr>
          <tr style="border-bottom:1px solid #eee;"><td style="padding:12px;color:#888;"><strong>Preferred Date</strong></td><td style="padding:12px;color:#222;">${formattedDate}</td></tr>
          <tr><td style="padding:12px;color:#888;vertical-align:top;"><strong>Client Message</strong></td><td style="padding:12px;color:#333;white-space:pre-wrap;">${booking.message || 'None'}</td></tr>
        </table>

        <div style="text-align:center;margin-top:24px;">
          <a href="http://localhost:5000/admin/bookings.html" style="background:#b8892f;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block;">Open in Admin Panel</a>
        </div>
      </div>
    `,
  });
};

/**
 * Send Confirmation Email to Client (if email provided)
 */
const sendBookingConfirmationToClient = async (booking) => {
  if (!booking.email) return false;

  const formattedDate = booking.preferredDate 
    ? new Date(booking.preferredDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : 'To be decided';

  return sendEmail({
    to: booking.email,
    subject: `We Received Your Booking Request! — Hobby Studio Visnagar`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #e0d8c8;border-radius:12px;background:#fcfbf8;">
        <h2 style="color:#b8892f;margin-top:0;">Hello ${booking.name},</h2>
        <p style="color:#444;line-height:1.6;">Thank you for contacting <strong>Hobby Studio</strong>! We have received your booking request for <strong>${booking.service}</strong>.</p>
        <p style="color:#444;line-height:1.6;">Our team will review your session details and contact you within 24 hours at <strong>${booking.phone}</strong> to confirm scheduling.</p>

        <div style="background:#fff;border:1px solid #eee;border-radius:8px;padding:16px;margin:20px 0;">
          <h4 style="margin:0 0 10px;color:#b8892f;">Summary of Request</h4>
          <p style="margin:4px 0;color:#666;"><strong>Service:</strong> ${booking.service}</p>
          <p style="margin:4px 0;color:#666;"><strong>Date:</strong> ${formattedDate}</p>
          ${booking.message ? `<p style="margin:4px 0;color:#666;"><strong>Your Note:</strong> ${booking.message}</p>` : ''}
        </div>

        <hr style="border:none;border-top:1px solid #e8e0d0;margin:24px 0;">
        <p style="color:#888;font-size:0.85em;line-height:1.5;margin:0;">
          <strong>Hobby Studio</strong><br>
          Visnagar, Gujarat, India<br>
          Phone: +91 98790 81558 | WhatsApp: +91 98790 81558<br>
          Email: <a href="mailto:hobbystudiophotography@gmail.com" style="color:#b8892f;">hobbystudiophotography@gmail.com</a>
        </p>
      </div>
    `,
  });
};

module.exports = {
  sendEmail,
  sendNewBookingNotification,
  sendBookingConfirmationToClient,
};
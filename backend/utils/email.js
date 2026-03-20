const nodemailer = require('nodemailer');

// Supports both Brevo (SMTP_HOST/SMTP_USER/SMTP_PASS) and legacy (EMAIL_HOST/EMAIL_USER/EMAIL_PASS)
const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST  || process.env.EMAIL_HOST || 'smtp-relay.brevo.com',
  port:   parseInt(process.env.SMTP_PORT  || process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER  || process.env.EMAIL_USER,
    pass: process.env.SMTP_PASS  || process.env.EMAIL_PASS,
  },
});

/**
 * Send an email via Brevo (or any SMTP provider)
 * @param {Object} options - { to, subject, html, text }
 */
const sendEmail = async (options) => {
  const from = process.env.SENDER_EMAIL || process.env.EMAIL_FROM || process.env.SMTP_USER;

  if (!from) {
    console.warn('⚠️  Email not configured — skipping send');
    return;
  }

  const mailOptions = {
    from: `Golf Charity Platform <${from}>`,
    to:      options.to,
    subject: options.subject,
    html:    options.html,
    text:    options.text || options.html?.replace(/<[^>]+>/g, ''),
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`✉️  Email sent → ${options.to} [${info.messageId}]`);
  return info;
};

module.exports = { sendEmail };

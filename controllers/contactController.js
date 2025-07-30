const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

exports.sendContactEmail = async (req, res) => {
  try {
    const { name, email, message, recaptchaToken } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'All fields required.' });
    }

    // Optionally: verify recaptchaToken here

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: 'adeyemibabatundejoseph@gmail.com', // Send to yourself/admin
      replyTo: email,
      subject: 'New Contact Form Submission',
      html: `
        <h2>New Message from Property Wey Contact Form</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Message:</b><br>${message.replace(/\n/g, '<br>')}</p>
      `,
    });

    return res.json({ message: 'Message sent successfully!' });
  } catch (err) {
    console.error('🔥 Contact Form Email Error:', err);
    return res
      .status(500)
      .json({ message: 'Email sending failed', error: err.message });
  }
};

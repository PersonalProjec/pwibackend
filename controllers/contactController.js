const Contact = require('../models/Contact');
const nodemailer = require('nodemailer');

exports.submitContact = async (req, res) => {
  try {
    const contact = new Contact(req.body);
    await contact.save();

    // Send email
    const transporter = nodemailer.createTransport({
      service: 'gmail', // or your email provider
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASS, // set this in .env
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO,
      subject: `New Contact Message from ${contact.name}`,
      text: `${contact.message} \n\nFrom: ${contact.email}`,
    });

    res.status(200).json({ message: 'Message received' });
  } catch (err) {
    res.status(500).json({ message: 'Error submitting form' });
  }
};

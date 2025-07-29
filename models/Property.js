const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: String,
  type: { type: String, enum: ['Sale', 'Rent', 'Shortlet'] },
  location: String,
  price: String,
  description: String,
  images: [String],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Property', propertySchema);

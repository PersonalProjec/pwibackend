const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    price: { type: Number, required: true },
    area: { type: String },
    type: { type: String },
    category: { type: String },
    tags: [String],
    images: [String],
    featured: { type: Boolean, default: false },
    approved: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ['active', 'inactive', 'expired'],
      default: 'active',
    },
    views: { type: Number, default: 0 },
    viewedAt: [{ type: Date }],
    currency: {
      type: String,
      default: 'NGN', // Default to Nigerian Naira
      enum: ['NGN', 'USD', 'EUR', 'GBP', 'CAD'], // Expand as needed!
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Property', PropertySchema);

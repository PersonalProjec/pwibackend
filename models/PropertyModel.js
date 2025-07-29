const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    price: { type: Number, required: true },
    area: { type: String },
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
  },
  { timestamps: true }
);

module.exports = mongoose.model('Property', PropertySchema);

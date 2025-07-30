const Property = require('../models/PropertyModel');
const cloudinary = require('cloudinary').v2;

exports.uploadProperty = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      location,
      tags = '',
      category,
      type,
      status,
      currency = 'NGN',
    } = req.body;

    if (!title || !price || !location || !description || !category || !type) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ message: 'Required fields missing' });
    }

    const existing = await Property.findOne({
      title: new RegExp(`^${title}$`, 'i'),
    });
    if (existing) {
      console.log('❌ Duplicate title found');
      return res.status(409).json({ message: 'Duplicate title found' });
    }

    if (!req.files || req.files.length === 0) {
      console.log('❌ No images provided');
      return res
        .status(400)
        .json({ message: 'At least one image is required' });
    }
    const uploadedImages = [];
    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'properties',
      });
      uploadedImages.push(result.secure_url);
    }

    // Defensive conversion and status enum
    const allowedStatus = ['active', 'inactive', 'expired'];
    const safeStatus = allowedStatus.includes(status) ? status : 'active';

    const newProperty = new Property({
      title,
      description,
      price: Number(price),
      location,
      category,
      type,
      status: safeStatus,
      currency,
      area: req.body.area || '',
      featured: req.body.featured === 'true',
      approved: req.body.approved === 'true',
      tags:
        typeof tags === 'string'
          ? tags
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean)
          : Array.isArray(tags)
          ? tags
          : [],
      images: uploadedImages,
    });

    await newProperty.save();

    console.log('✅ Property saved:', newProperty);

    return res.status(201).json({
      message: 'Property uploaded successfully',
      property: newProperty,
    });
  } catch (err) {
    console.error('🔥 Upload Error:', err);
    // Send full error in development, simple in prod
    return res.status(500).json({ message: err.message || 'Server error' });
  }
};

exports.getAllProperties = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.max(1, parseInt(req.query.limit) || 20);
    const search = req.query.search?.trim();
    const category = req.query.category?.trim();

    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Only filter by category if provided and not 'All'
    if (category && category !== 'All') {
      query.category = category;
    }

    const skip = (page - 1) * limit;
    const total = await Property.countDocuments(query);
    const properties = await Property.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.json({
      properties,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit,
    });
  } catch (err) {
    console.error('🔥 Get Properties Error:', err);
    res
      .status(500)
      .json({ message: 'Failed to fetch properties', error: err.message });
  }
};

exports.getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    property.views += 1;
    await property.save();
    res.json({ property });
  } catch (err) {
    console.error('🔥 Get Property Error:', err);
    res
      .status(500)
      .json({ message: 'Failed to fetch property', error: err.message });
  }
};

exports.editProperty = async (req, res) => {
  try {
    const existingImages = req.body.existingImages
      ? JSON.parse(req.body.existingImages)
      : [];
    let newImageUrls = [];
    if (req.files && req.files.images) {
      newImageUrls = req.files.images.map((file) => file.path);
    }
    if (req.files && req.files.newImages) {
      newImageUrls = newImageUrls.concat(
        req.files.newImages.map((file) => file.path)
      );
    }

    // Merge all (existing + new)
    const updatedImages = [...existingImages, ...newImageUrls];

    // Proceed with rest of update logic (other fields, type conversions, etc)
    // ...
    const updateFields = [
      'title',
      'description',
      'location',
      'price',
      'area',
      'tags',
      'type',
      'category',
      'currency',
      'featured',
      'approved',
      'status',
    ];
    const updates = {};
    for (const field of updateFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    // Type conversions (as before)
    if (typeof updates.featured === 'string')
      updates.featured = updates.featured === 'true';
    if (typeof updates.approved === 'string')
      updates.approved = updates.approved === 'true';
    if (typeof updates.price === 'string')
      updates.price = Number(updates.price);
    if (updates.tags && typeof updates.tags === 'string') {
      updates.tags = updates.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
    }
    if (updates.features && typeof updates.features === 'string') {
      updates.features = updates.features
        .split(',')
        .map((f) => f.trim())
        .filter(Boolean);
    }

    // Always update images array
    updates.images = updatedImages;

    const updated = await Property.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.json({ message: 'Property updated', property: updated });
  } catch (err) {
    console.error('🔥 Edit Property Error:', err);
    res.status(500).json({
      message: err.message || 'Failed to update property',
      error: err,
    });
  }
};

exports.deleteProperty = async (req, res) => {
  try {
    const deleted = await Property.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.json({ message: 'Property deleted' });
  } catch (err) {
    console.error('🔥 Delete Property Error:', err);
    res.status(500).json({
      message: err.message || 'Failed to delete property',
      error: err,
    });
  }
};

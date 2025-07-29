const Property = require('../models/PropertyModel');
const Contact = require('../models/Contact');
const Admin = require('../models/AdminModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.AdminLogin = async (req, res) => {
  const { identifier, password } = req.body;

  try {
    const admin = await Admin.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!admin) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin._id, role: 'admin' },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d',
      }
    );

    res.json({
      token,
      admin: {
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAdminProfile = async (req, res) => {
  try {
    // req.user.id should be available from your middleware (set by JWT)
    const admin = await Admin.findById(req.user.id).select('-password');
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    res.json({ admin });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to fetch profile' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: 'Both old and new passwords are required' });
    }
    const admin = await Admin.findById(req.user.id);
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    const match = await bcrypt.compare(oldPassword, admin.password);
    if (!match)
      return res.status(401).json({ message: 'Old password is incorrect' });

    // Hash new password and save
    const hash = await bcrypt.hash(newPassword, 12);
    admin.password = hash;
    await admin.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res
      .status(500)
      .json({ message: err.message || 'Failed to change password' });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    const monthAgo = new Date(now);
    monthAgo.setMonth(now.getMonth() - 1);

    // General stats
    const totalProperties = await Property.countDocuments();
    const totalContacts = await Contact.countDocuments();
    const verifiedProperties = await Property.countDocuments({
      approved: true,
    });
    const limitedOffers = await Property.countDocuments({
      tags: { $in: ['limited', 'offer'] },
    });
    const totalPropertyViews = await Property.aggregate([
      { $group: { _id: null, total: { $sum: '$views' } } },
    ]);

    // Last week/month properties
    const propertiesLastWeek = await Property.countDocuments({
      createdAt: { $gte: weekAgo },
    });
    const propertiesLastMonth = await Property.countDocuments({
      createdAt: { $gte: monthAgo },
    });

    const topAgents = await Property.aggregate([
      { $group: { _id: '$agent', total: { $sum: 1 } } },
      { $sort: { total: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'agents',
          localField: '_id',
          foreignField: '_id',
          as: 'agent',
        },
      },
      { $unwind: '$agent' },
      {
        $project: {
          _id: 0,
          name: '$agent.name',
          email: '$agent.email',
          total: 1,
        },
      },
    ]);

    res.json({
      totalProperties,
      totalContacts,
      verifiedProperties,
      limitedOffers,
      totalPropertyViews: totalPropertyViews[0]?.total || 0,
      propertiesLastWeek,
      propertiesLastMonth,
      topAgents,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: err.message || 'Failed to fetch dashboard stats' });
  }
};

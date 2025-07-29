const Booking = require('../models/Booking');
const Property = require('../models/PropertyModel');

// Create a booking (Public)
exports.createBooking = async (req, res) => {
  try {
    const { property, name, phone, email, visitDate } = req.body;

    // Basic validation
    if (!property || !name || !phone || !visitDate) {
      return res
        .status(400)
        .json({ message: 'All required fields must be filled.' });
    }

    // Optionally: Check property exists
    const foundProp = await Property.findById(property);
    if (!foundProp)
      return res.status(404).json({ message: 'Property not found.' });

    // Optionally: Prevent duplicate bookings for same property+phone+date
    const existing = await Booking.findOne({
      property,
      phone,
      visitDate: {
        $gte: new Date(visitDate).setHours(0, 0, 0, 0),
        $lte: new Date(visitDate).setHours(23, 59, 59, 999),
      },
    });
    if (existing)
      return res.status(409).json({
        message: 'You have already booked this property for this date.',
      });

    const booking = await Booking.create({
      property,
      name,
      phone,
      email,
      visitDate,
    });

    // TODO: send notification to admin or property owner

    res.status(201).json({ message: 'Booking successful!', booking });
  } catch (err) {
    console.error('🔥 Booking Error:', err);
    res
      .status(500)
      .json({ message: 'Failed to create booking', error: err.message });
  }
};

// Get all bookings (Admin)
exports.getBookings = async (req, res) => {
  try {
    const { property } = req.query; // Optional filter
    const query = property ? { property } : {};
    const bookings = await Booking.find(query)
      .populate('property', 'title location price')
      .sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Failed to fetch bookings', error: err.message });
  }
};

// Get a single booking by ID (Admin)
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate(
      'property',
      'title location price'
    );
    if (!booking)
      return res.status(404).json({ message: 'Booking not found.' });
    res.json({ booking });
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Failed to fetch booking', error: err.message });
  }
};

// Update booking status (Admin)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status)
      return res.status(400).json({ message: 'Status is required.' });

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!booking)
      return res.status(404).json({ message: 'Booking not found.' });

    res.json({ message: 'Booking status updated', booking });
  } catch (err) {
    console.error('🔥 Update Booking Error:', err);
    res
      .status(500)
      .json({ message: 'Failed to update booking', error: err.message });
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking)
      return res.status(404).json({ message: 'Booking not found.' });
    res.json({ message: 'Booking deleted' });
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Failed to delete booking', error: err.message });
  }
};

const express = require('express');
const router = express.Router();
const {
  createBooking,
  getBookings,         // Admin: list all or by property
  getBookingById,      // Admin: view details
  updateBookingStatus, // Admin: change status
  deleteBooking,       // Admin: delete booking
} = require('../controllers/bookingController');

// Public route to book a visit (no auth required)
router.post('/', createBooking);

// Admin routes (add auth middleware as needed)
router.get('/', getBookings); // Optionally: add adminAuth
router.get('/:id', getBookingById);
router.put('/:id/status', updateBookingStatus);
router.delete('/:id', deleteBooking);

module.exports = router;

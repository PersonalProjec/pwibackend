const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/multerCloudinary');
const {
  uploadProperty,
  getAllProperties,
  getPropertyById,
  editProperty,
  deleteProperty,
} = require('../controllers/propertyController');

router.post(
  '/upload',
  authMiddleware,
  adminAuth,
  upload.array('images', 6),
  uploadProperty
);
router.get('/', getAllProperties);
router.get('/:id', authMiddleware, adminAuth, getPropertyById);
router.put(
  '/:id',
  authMiddleware,
  adminAuth,
  upload.fields([
    { name: 'images', maxCount: 6 },
    { name: 'newImages', maxCount: 6 },
  ]),
  editProperty
);
router.delete('/:id', authMiddleware, adminAuth, deleteProperty);

module.exports = router;

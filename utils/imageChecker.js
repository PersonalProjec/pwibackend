const axios = require('axios');
const sizeOf = require('image-size');

const checkImageQuality = async (imageUrl) => {
  try {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data); // Convert to Buffer
    const dimensions = sizeOf(buffer); // Now this works

    const minWidth = 1024;
    const minHeight = 768;

    return dimensions.width >= minWidth && dimensions.height >= minHeight;
  } catch (error) {
    console.error('Quality check failed:', error.message);
    return false;
  }
};

module.exports = checkImageQuality;

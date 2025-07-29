const exifr = require('exifr');

const checkEXIFDate = async (imagePath) => {
  try {
    const data = await exifr.parse(imagePath);
    if (!data || !data.CreateDate) return false;

    const takenDate = new Date(data.CreateDate);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    return takenDate > oneYearAgo;
  } catch (err) {
    console.warn('📸 EXIF parsing error:', err.message);
    return false; // If no EXIF or error, assume fail
  }
};

module.exports = checkEXIFDate;

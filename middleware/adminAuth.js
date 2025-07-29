module.exports = (req, res, next) => {
  console.log('🔥 Admin Auth Middleware:', req.user);
  try {
    if (!req.user || req.user.role !== 'admin') {
      console.log("error from here")
      return res.status(403).json({ message: 'Unauthorized: Admins only' });
    }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Auth failed' });
  }
};

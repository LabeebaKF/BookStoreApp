const jwt = require('jsonwebtoken');

// --- Verify Token ---
exports.verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) return res.status(403).json({ message: "Invalid token" });

    // FIX: Prioritize 'id' (from dedicated admin login), then 'adminId' (from combined login), then 'userId'.
    req.userId = decoded.id || decoded.adminId || decoded.userId || null;
    req.username = decoded.username || null;
    req.userRole = decoded.role || null;

    // Check if a user/admin ID was successfully extracted
    if (!req.userId) return res.status(403).json({ message: "Invalid token payload: Missing user/admin ID." });

    next();
  } catch (err) {
    console.error("Token verification error:", err);
    // This catches expired tokens, malformed tokens, and incorrect secrets.
    return res.status(403).json({ message: "Invalid token" });
  }
};

// --- Admin only ---
exports.authAdmin = (req, res, next) => {
  exports.verifyToken(req, res, () => {
    if (req.userRole === 'admin') return next();
    return res.status(403).json({ message: 'Access denied: Admin only' });
  });
};
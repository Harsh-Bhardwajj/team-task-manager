import jwt from "jsonwebtoken";

// 🔐 Protect route
export const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ msg: "No token, access denied" });
  }

  // ✅ Bearer token split
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret123");

    // ⚡ FIX: Ensure req.user has an 'id' property even if decoded has '_id'
    req.user = {
      ...decoded,
      id: decoded.id || decoded._id, // Dono cases handle ho jayenge
    };

    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err.message);
    return res.status(401).json({ msg: "Invalid token" });
  }
};

// 👑 Admin only
export const adminOnly = (req, res, next) => {
  // Pehle check karo req.user exist karta hai ya nahi
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ msg: "Admin only access" });
  }
  next();
};

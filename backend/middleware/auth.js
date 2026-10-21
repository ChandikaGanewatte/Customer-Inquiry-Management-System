const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  const token = authorization.slice(7);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (!Number.isInteger(payload.userId)) {
      return res.status(401).json({
        message: "Invalid authentication token",
      });
    }

    req.user = {
      id: payload.userId,
      email: payload.email,
    };

    next();
  } catch {
    return res.status(401).json({
      message: "Invalid or expired authentication token",
    });
  }
}

module.exports = requireAuth;
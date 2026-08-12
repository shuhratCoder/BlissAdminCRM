const jwt = require("jsonwebtoken");

function adminAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Token topilmadi",
      });
    }

    const [type, token] = authHeader.split(" ");

    if (type !== "Bearer" || !token) {
      return res.status(401).json({
        success: false,
        message: "Token formati noto'g'ri",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_ADMIN_SECRET
    );

    req.admin = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token noto'g'ri yoki muddati tugagan",
    });
  }
}

module.exports = adminAuth;
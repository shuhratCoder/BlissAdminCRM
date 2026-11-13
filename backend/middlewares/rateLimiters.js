const { rateLimit } = require("express-rate-limit");

function tooManyRequests(message) {
  return (req, res) => {
    res.status(429).json({
      success: false,
      code: "TOO_MANY_REQUESTS",
      message,
    });
  };
}

/*
 * Login / setup: faqat muvaffaqiyatsiz urinishlar sanaladi.
 * Bitta IP dan 15 daqiqada 10 ta xato urinish.
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: tooManyRequests(
    "Juda ko'p urinish. Birozdan keyin qayta urinib ko'ring."
  ),
});

/*
 * License tekshiruvi: desktop ilovalar har kirishda chaqiradi,
 * shuning uchun limit kengroq.
 */
const verifyLicenseLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 120,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: tooManyRequests(
    "Juda ko'p so'rov. Birozdan keyin qayta urinib ko'ring."
  ),
});

/*
 * Zaxira nusxa: desktop ilova soatiga bir necha marta murojaat qiladi.
 */
const backupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: tooManyRequests(
    "Juda ko'p so'rov. Birozdan keyin qayta urinib ko'ring."
  ),
});

module.exports = {
  loginLimiter,
  verifyLicenseLimiter,
  backupLimiter,
};

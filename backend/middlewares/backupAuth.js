const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const Owner = require("../models/owner");

const BACKUP_TOKEN_TYPE = "desktop-backup";

/*
 * Parol o'zgarganda eski backup tokenlar o'z-o'zidan yaroqsiz bo'lishi
 * uchun tokenga parol xeshining qisqa izi qo'shiladi.
 */
function passwordFingerprint(owner) {
  return crypto
    .createHash("sha256")
    .update(String(owner.password))
    .digest("hex")
    .slice(0, 16);
}

/*
 * Desktop ilova login/parol bilan kirganda beriladi. Uzoq muddatli:
 * ilova uni saqlab, zaxira nusxani fonda yuborib turadi.
 */
function signBackupToken(owner) {
  return jwt.sign(
    {
      ownerId: owner.id,
      pv: passwordFingerprint(owner),
      type: BACKUP_TOKEN_TYPE,
    },
    process.env.JWT_LICENSE_SECRET,
    {
      expiresIn: "5y",
    }
  );
}

async function backupAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";

    const [type, token] = authHeader.split(" ");

    if (type !== "Bearer" || !token) {
      return res.status(401).json({
        success: false,
        code: "BACKUP_TOKEN_REQUIRED",
        message: "Token topilmadi",
      });
    }

    let decoded;

    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_LICENSE_SECRET
      );
    } catch (error) {
      return res.status(401).json({
        success: false,
        code: "BACKUP_TOKEN_INVALID",
        message: "Token noto'g'ri yoki muddati tugagan",
      });
    }

    if (
      decoded.type !== BACKUP_TOKEN_TYPE ||
      !decoded.ownerId
    ) {
      return res.status(401).json({
        success: false,
        code: "BACKUP_TOKEN_INVALID",
        message: "Token noto'g'ri",
      });
    }

    const owner = await Owner.findByPk(decoded.ownerId);

    if (
      !owner ||
      decoded.pv !== passwordFingerprint(owner)
    ) {
      return res.status(401).json({
        success: false,
        code: "BACKUP_TOKEN_INVALID",
        message: "Token yaroqsiz. Qayta login qiling.",
      });
    }

    if (owner.status !== "active") {
      return res.status(403).json({
        success: false,
        code: "OWNER_BLOCKED",
        message: "Hisob bloklangan",
      });
    }

    req.owner = owner;

    next();
  } catch (error) {
    console.error("BACKUP AUTH ERROR:", error);

    return res.status(500).json({
      success: false,
      code: "SERVER_ERROR",
      message: error.message,
    });
  }
}

module.exports = {
  backupAuth,
  signBackupToken,
};

const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Owner = require("../models/owner");
const License = require("../models/license");

// DESKTOP APP LOGIN
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Validation
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username va password majburiy",
      });
    }

    // 2. Owner + License topish
    const owner = await Owner.findOne({
      where: {
        username,
      },
      include: [
        {
          model: License,
          as: "license",
        },
      ],
    });

    if (!owner) {
      return res.status(401).json({
        success: false,
        message: "Login yoki parol noto'g'ri",
      });
    }

    // 3. Password tekshirish
    const isPasswordValid = await bcrypt.compare(
      password,
      owner.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Login yoki parol noto'g'ri",
      });
    }

    // 4. Owner bloklanganmi?
    if (owner.status !== "active") {
      return res.status(403).json({
        success: false,
        code: "OWNER_BLOCKED",
        message: "Hisob bloklangan",
      });
    }

    // 5. License mavjudmi?
    if (!owner.license) {
      return res.status(403).json({
        success: false,
        code: "LICENSE_NOT_FOUND",
        message: "Litsenziya topilmadi",
      });
    }

    // 6. License bloklanganmi?
    if (owner.license.status !== "active") {
      return res.status(403).json({
        success: false,
        code: "LICENSE_INACTIVE",
        message: "Litsenziya faol emas",
      });
    }

    // 7. Muddat tekshirish
    const now = new Date();
    const expiresAt = new Date(
      owner.license.expiresAt
    );

    if (expiresAt <= now) {
      // DB statusni ham yangilaymiz
      await owner.license.update({
        status: "expired",
      });

      return res.status(403).json({
        success: false,
        code: "LICENSE_EXPIRED",
        message: "Foydalanish muddati tugagan",
        expiresAt,
      });
    }

    // 8. Desktop license token
    const licenseToken = jwt.sign(
      {
        ownerId: owner.id,
        companyName: owner.companyName,
        username: owner.username,
        licenseId: owner.license.id,
        expiresAt: owner.license.expiresAt,
        type: "desktop-license",
      },
      process.env.JWT_LICENSE_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login muvaffaqiyatli",

      owner: {
        id: owner.id,
        companyName: owner.companyName,
        username: owner.username,
        phone: owner.phone,
      },

      license: {
        id: owner.license.id,
        startsAt: owner.license.startsAt,
        expiresAt: owner.license.expiresAt,
        status: owner.license.status,
      },

      licenseToken,
    });

  } catch (error) {
    console.error(
      "DESKTOP LOGIN ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.post("/verify-license", async (req, res) => {
  try {
    const {
      ownerId,
      licenseId,
    } = req.body;

    // ========================================================
    // 1. VALIDATION
    // ========================================================

    if (!ownerId || !licenseId) {
      return res.status(400).json({
        success: false,
        code: "LICENSE_DATA_REQUIRED",
        message: "License ma'lumotlari to'liq emas",
      });
    }

    // ========================================================
    // 2. OWNER TOPISH
    // ========================================================

    const owner = await Owner.findByPk(ownerId);

    if (!owner) {
      return res.status(404).json({
        success: false,
        code: "OWNER_NOT_FOUND",
        message: "Foydalanuvchi topilmadi",
      });
    }

    // ========================================================
    // 3. OWNER STATUS TEKSHIRISH
    // ========================================================

    if (owner.status !== "active") {
      return res.status(403).json({
        success: false,
        code: "OWNER_BLOCKED",
        message: "Hisob bloklangan",
      });
    }

    // ========================================================
    // 4. LICENSE TOPISH
    // ========================================================

    const license = await License.findOne({
      where: {
        id: licenseId,
        ownerId: owner.id,
      },
    });

    if (!license) {
      return res.status(404).json({
        success: false,
        code: "LICENSE_NOT_FOUND",
        message: "Litsenziya topilmadi",
      });
    }

    // ========================================================
    // 5. LICENSE BLOCKED
    // ========================================================

    if (license.status === "blocked") {
      return res.status(403).json({
        success: false,
        code: "LICENSE_BLOCKED",
        message: "Litsenziya bloklangan",
      });
    }

    // ========================================================
    // 6. LICENSE DATE TEKSHIRISH
    // ========================================================

    const now = new Date();

    const expiresAt = new Date(
      license.expiresAt
    );

    if (
      Number.isNaN(expiresAt.getTime())
    ) {
      return res.status(403).json({
        success: false,
        code: "LICENSE_DATE_INVALID",
        message: "Litsenziya muddati noto'g'ri",
      });
    }

    // ========================================================
    // 7. LICENSE EXPIRED
    // ========================================================

    if (expiresAt <= now) {
      if (license.status !== "expired") {
        await license.update({
          status: "expired",
        });
      }

      return res.status(403).json({
        success: false,
        code: "LICENSE_EXPIRED",
        message: "Foydalanish muddati tugagan",
        expiresAt: license.expiresAt,
      });
    }

    // ========================================================
    // 8. STATUS ACTIVE EMAS
    // ========================================================

    if (license.status !== "active") {
      return res.status(403).json({
        success: false,
        code: "LICENSE_INACTIVE",
        message: "Litsenziya faol emas",
      });
    }

    // ========================================================
    // 9. LICENSE ACTIVE
    // ========================================================

    return res.status(200).json({
      success: true,
      message: "Litsenziya faol",

      owner: {
        id: owner.id,
        companyName: owner.companyName,
        username: owner.username,
        phone: owner.phone,
        status: owner.status,
      },

      license: {
        id: license.id,
        startsAt: license.startsAt,
        expiresAt: license.expiresAt,
        status: license.status,
      },
    });

  } catch (error) {
    console.error(
      "VERIFY LICENSE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      code: "SERVER_ERROR",
      message: error.message,
    });
  }
});
module.exports = router;
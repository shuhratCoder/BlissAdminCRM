const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Admin = require("../models/admin");


// BIRINCHI ADMIN YARATISH
router.post("/setup", async (req, res) => {
  try {
    const adminCount = await Admin.count();

    if (adminCount > 0) {
      return res.status(403).json({
        success: false,
        message: "Admin allaqachon yaratilgan",
      });
    }

    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username va password majburiy",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const admin = await Admin.create({
      username,
      password: hashedPassword,
    });

    return res.status(201).json({
      success: true,
      message: "Birinchi admin yaratildi",
      admin: {
        id: admin.id,
        username: admin.username,
      },
    });
  } catch (error) {
    console.error("ADMIN SETUP ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


// ADMIN LOGIN
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
console.log("Login request body:", req.body);
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username va password majburiy",
      });
    }

    const admin = await Admin.findOne({
      where: { username },
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Login yoki parol noto'g'ri",
      });
    }

    const isValid = await bcrypt.compare(
      password,
      admin.password
    );

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "Login yoki parol noto'g'ri",
      });
    }

    const token = jwt.sign(
      {
        id: admin.id,
        username: admin.username,
        role: "admin",
      },
      process.env.JWT_ADMIN_SECRET,
      {
        expiresIn: "12h",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login muvaffaqiyatli",
      token,
      admin: {
        id: admin.id,
        username: admin.username,
      },
    });
  } catch (error) {
    console.error("ADMIN LOGIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
const router = require("express").Router();
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");

const Owner = require("../models/owner");
const License = require("../models/license");
const adminAuth = require("../middlewares/adminauth");


// YANGI OWNER + LICENSE
router.post(
  "/createOwner",
  adminAuth,
  async (req, res) => {
    try {
      const {
        companyName,
        username,
        password,
        phone,
        expiresAt,
      } = req.body;

      if (
        !companyName ||
        !username ||
        !password ||
        !expiresAt
      ) {
        return res.status(400).json({
          success: false,
          message:
            "companyName, username, password va expiresAt majburiy",
        });
      }

      const existingOwner = await Owner.findOne({
        where: { username },
      });

      if (existingOwner) {
        return res.status(409).json({
          success: false,
          message: "Bu username band",
        });
      }

      const expireDate = new Date(expiresAt);

      if (isNaN(expireDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Litsenziya tugash sanasi noto'g'ri",
        });
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      expireDate.setHours(23, 59, 59, 999);

      if (expireDate <= today) {
        return res.status(400).json({
          success: false,
          message:
            "Litsenziya tugash sanasi bugundan keyin bo'lishi kerak",
        });
      }

      const hashedPassword = await bcrypt.hash(
        password,
        10
      );

      const owner = await Owner.create({
        companyName,
        username,
        password: hashedPassword,
        phone,
        status: "active",
      });

      const license = await License.create({
        ownerId: owner.id,
        startsAt: new Date(),
        expiresAt: expireDate,
        status: "active",
      });

      return res.status(201).json({
        success: true,
        message: "Owner va license yaratildi",
        owner: {
          id: owner.id,
          companyName: owner.companyName,
          username: owner.username,
          phone: owner.phone,
          status: owner.status,
        },
        license,
      });
    } catch (error) {
      console.error("CREATE OWNER ERROR:", error);

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);
// DASHBOARD
router.get(
  "/dashboard",
  adminAuth,
  async (req, res) => {
    try {
      const now = new Date();

      const totalOwners = await Owner.count();

      const activeOwners = await Owner.count({
        where: {
          status: "active",
        },
      });

      const blockedOwners = await Owner.count({
        where: {
          status: "blocked",
        },
      });

      const expiredOwners = await License.count({
        where: {
          expiresAt: {
            [Op.lt]: now,
          },
        },
      });

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const expireToday = await License.count({
        where: {
          expiresAt: {
            [Op.between]: [todayStart, todayEnd],
          },
        },
      });

      const latestOwners = await Owner.findAll({
        limit: 5,
        order: [["createdAt", "DESC"]],
        attributes: {
          exclude: ["password"],
        },
        include: [
          {
            model: License,
            as: "license",
          },
        ],
      });

      res.json({
        success: true,
        stats: {
          totalOwners,
          activeOwners,
          blockedOwners,
          expiredOwners,
          expireToday,
        },
        latestOwners,
      });
    } catch (err) {
      console.log(err);

      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
);
// BARCHA OWNERLAR
router.get(
  "/",
  adminAuth,
  async (req, res) => {
    try {
      const page = Number(req.query.page || 1);
      const limit = Number(req.query.limit || 10);
      const search = req.query.search || "";
      const status = req.query.status || "all";

      const ownerWhere = {};

      if (search) {
        ownerWhere[Op.or] = [
          {
            companyName: {
              [Op.iLike]: `%${search}%`,
            },
          },
          {
            username: {
              [Op.iLike]: `%${search}%`,
            },
          },
          {
            phone: {
              [Op.iLike]: `%${search}%`,
            },
          },
        ];
      }

      if (status !== "all") {
        ownerWhere.status = status;
      }

      const { count, rows } =
        await Owner.findAndCountAll({
          where: ownerWhere,

          include: [
            {
              model: License,
              as: "license",
            },
          ],

          attributes: {
            exclude: ["password"],
          },

          order: [["createdAt", "DESC"]],

          limit,

          offset: (page - 1) * limit,
        });

      return res.json({
        success: true,

        owners: rows,

        pagination: {
          page,
          limit,
          total: count,
          pages: Math.ceil(count / limit),
        },
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);
// BITTA OWNER
router.get(
  "/:id",
  adminAuth,
  async (req, res) => {
    try {
      const owner = await Owner.findByPk(
        req.params.id,
        {
          attributes: {
            exclude: ["password"],
          },
          include: [
            {
              model: License,
              as: "license",
            },
          ],
        }
      );

      if (!owner) {
        return res.status(404).json({
          success: false,
          message: "Owner topilmadi",
        });
      }

      return res.status(200).json({
        success: true,
        owner,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);


// OWNERNI BLOCK QILISH
router.patch(
  "/:id/block",
  adminAuth,
  async (req, res) => {
    try {
      const owner = await Owner.findByPk(
        req.params.id
      );

      if (!owner) {
        return res.status(404).json({
          success: false,
          message: "Owner topilmadi",
        });
      }

      await owner.update({
        status: "blocked",
      });

      await License.update(
        {
          status: "blocked",
        },
        {
          where: {
            ownerId: owner.id,
          },
        }
      );

      return res.status(200).json({
        success: true,
        message: "Owner bloklandi",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);


// LICENSE UZAYTIRISH
// LICENSE UZAYTIRISH
router.patch(
  "/:id/extend-license",
  adminAuth,
  async (req, res) => {
    try {
      const { expiresAt } = req.body;

      if (!expiresAt) {
        return res.status(400).json({
          success: false,
          message: "expiresAt majburiy",
        });
      }

      const owner = await Owner.findByPk(req.params.id);

      if (!owner) {
        return res.status(404).json({
          success: false,
          message: "Owner topilmadi",
        });
      }

      const license = await License.findOne({
        where: {
          ownerId: owner.id,
        },
      });

      if (!license) {
        return res.status(404).json({
          success: false,
          message: "License topilmadi",
        });
      }

      const newExpireDate = new Date(expiresAt);

      if (isNaN(newExpireDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Litsenziya tugash sanasi noto'g'ri",
        });
      }

      newExpireDate.setHours(23, 59, 59, 999);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (newExpireDate <= today) {
        return res.status(400).json({
          success: false,
          message:
            "Litsenziya tugash sanasi bugundan keyin bo'lishi kerak",
        });
      }

      await license.update({
        expiresAt: newExpireDate,
        status: "active",
      });

      await owner.update({
        status: "active",
      });

      return res.status(200).json({
        success: true,
        message: "License yangilandi",
        license,
      });
    } catch (error) {
      console.error("EXTEND LICENSE ERROR:", error);

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);
// OWNERNI TAHRIRLASH
router.put(
  "/:id",
  adminAuth,
  async (req, res) => {
    try {
      const {
        companyName,
        username,
        phone,
        address,
      } = req.body;

      const owner = await Owner.findByPk(req.params.id);

      if (!owner) {
        return res.status(404).json({
          success: false,
          message: "Owner topilmadi",
        });
      }

      if (
        username &&
        username !== owner.username
      ) {
        const existing = await Owner.findOne({
          where: {
            username,
            id: {
              [Op.ne]: owner.id,
            },
          },
        });

        if (existing) {
          return res.status(409).json({
            success: false,
            message: "Username band",
          });
        }
      }

      await owner.update({
        companyName,
        username,
        phone,
        address,
      });

      return res.json({
        success: true,
        message: "Owner yangilandi",
        owner,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);
// OWNERNI O'CHIRISH
router.delete(
  "/:id",
  adminAuth,
  async (req, res) => {
    try {
      const owner = await Owner.findByPk(req.params.id);

      if (!owner) {
        return res.status(404).json({
          success: false,
          message: "Owner topilmadi",
        });
      }

      await License.destroy({
        where: {
          ownerId: owner.id,
        },
      });

      await owner.destroy();

      return res.json({
        success: true,
        message: "Owner o'chirildi",
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);
// OWNER PAROLINI O'ZGARTIRISH
router.patch(
  "/:id/reset-password",
  adminAuth,
  async (req, res) => {
    try {
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({
          success: false,
          message: "Yangi parol kerak",
        });
      }

      const owner = await Owner.findByPk(req.params.id);

      if (!owner) {
        return res.status(404).json({
          success: false,
          message: "Owner topilmadi",
        });
      }

      const hash = await bcrypt.hash(password, 10);

      await owner.update({
        password: hash,
      });

      return res.json({
        success: true,
        message: "Parol yangilandi",
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);
module.exports = router;
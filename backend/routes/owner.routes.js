const router = require("express").Router();
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");

const Owner = require("../models/owner");
const License = require("../models/license");
const adminAuth = require("../middlewares/adminauth");

/*
|--------------------------------------------------------------------------
| YANGI OWNER + LICENSE
|--------------------------------------------------------------------------
*/

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
        address,
        expiresAt,
      } = req.body;

      /*
      |--------------------------------------------------------------------------
      | Majburiy fieldlar
      |--------------------------------------------------------------------------
      */

      if (
        !companyName ||
        !username ||
        !password ||
        !phone ||
        !address ||
        !expiresAt
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Korxona nomi, username, parol, telefon, manzil va litsenziya sanasi majburiy",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | Username tekshirish
      |--------------------------------------------------------------------------
      */

      const existingOwner = await Owner.findOne({
        where: {
          username: username.trim(),
        },
      });

      if (existingOwner) {
        return res.status(409).json({
          success: false,
          message: "Bu username band",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | Telefon tekshirish
      |--------------------------------------------------------------------------
      */

      const existingPhone = await Owner.findOne({
        where: {
          phone: phone.trim(),
        },
      });

      if (existingPhone) {
        return res.status(409).json({
          success: false,
          message: "Bu telefon raqami band",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | License sana
      |--------------------------------------------------------------------------
      */

      const expireDate = new Date(
        `${expiresAt}T23:59:59`
      );

      if (isNaN(expireDate.getTime())) {
        return res.status(400).json({
          success: false,
          message:
            "Litsenziya tugash sanasi noto'g'ri",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | Bugungi sana
      |--------------------------------------------------------------------------
      */

      const today = new Date();

      today.setHours(
        0,
        0,
        0,
        0
      );

      if (expireDate <= today) {
        return res.status(400).json({
          success: false,
          message:
            "Litsenziya tugash sanasi bugundan keyin bo'lishi kerak",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | Password hash
      |--------------------------------------------------------------------------
      */

      const hashedPassword =
        await bcrypt.hash(
          password,
          10
        );

      /*
      |--------------------------------------------------------------------------
      | Owner yaratish
      |--------------------------------------------------------------------------
      */

      const owner = await Owner.create({
        companyName:
          companyName.trim(),

        username:
          username.trim(),

        password:
          hashedPassword,

        phone:
          phone.trim(),

        address:
          address.trim(),

        status:
          "active",
      });

      /*
      |--------------------------------------------------------------------------
      | License yaratish
      |--------------------------------------------------------------------------
      */

      const license =
        await License.create({
          ownerId: owner.id,

          startsAt:
            new Date(),

          expiresAt:
            expireDate,

          status:
            "active",
        });

      /*
      |--------------------------------------------------------------------------
      | Response
      |--------------------------------------------------------------------------
      */

      return res.status(201).json({
        success: true,

        message:
          "Owner va license yaratildi",

        owner: {
          id: owner.id,

          companyName:
            owner.companyName,

          username:
            owner.username,

          phone:
            owner.phone,

          address:
            owner.address,

          status:
            owner.status,
        },

        license,
      });
    } catch (error) {
      console.error(
        "CREATE OWNER ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Serverda ichki xatolik yuz berdi",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| DASHBOARD
|--------------------------------------------------------------------------
*/

router.get(
  "/dashboard",
  adminAuth,
  async (req, res) => {
    try {
      const now =
        new Date();

      const totalOwners =
        await Owner.count();

      const activeOwners =
        await Owner.count({
          where: {
            status:
              "active",
          },
        });

      const blockedOwners =
        await Owner.count({
          where: {
            status:
              "blocked",
          },
        });

      const expiredOwners =
        await License.count({
          where: {
            expiresAt: {
              [Op.lt]:
                now,
            },
          },
        });

      const todayStart =
        new Date();

      todayStart.setHours(
        0,
        0,
        0,
        0
      );

      const todayEnd =
        new Date();

      todayEnd.setHours(
        23,
        59,
        59,
        999
      );

      const expireToday =
        await License.count({
          where: {
            expiresAt: {
              [Op.between]: [
                todayStart,
                todayEnd,
              ],
            },
          },
        });

      const latestOwners =
        await Owner.findAll({
          limit: 5,

          order: [
            [
              "createdAt",
              "DESC",
            ],
          ],

          attributes: {
            exclude: [
              "password",
            ],
          },

          include: [
            {
              model: License,
              as: "license",
            },
          ],
        });

      return res.json({
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
    } catch (error) {
      console.error(
        "DASHBOARD ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Serverda ichki xatolik yuz berdi",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| BARCHA OWNERLAR
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  adminAuth,
  async (req, res) => {
    try {
      const page = Math.max(
        Number(
          req.query.page || 1
        ),
        1
      );

      const limit = Math.min(
        Math.max(
          Number(
            req.query.limit ||
              10
          ),
          1
        ),
        100
      );

      const search =
        req.query.search ||
        "";

      const status =
        req.query.status ||
        "all";

      const ownerWhere = {};

      /*
      |--------------------------------------------------------------------------
      | Search
      |--------------------------------------------------------------------------
      */

      if (search) {
        ownerWhere[
          Op.or
        ] = [
          {
            companyName: {
              [Op.iLike]:
                `%${search}%`,
            },
          },

          {
            username: {
              [Op.iLike]:
                `%${search}%`,
            },
          },

          {
            phone: {
              [Op.iLike]:
                `%${search}%`,
            },
          },

          {
            address: {
              [Op.iLike]:
                `%${search}%`,
            },
          },
        ];
      }

      /*
      |--------------------------------------------------------------------------
      | Status filter
      |--------------------------------------------------------------------------
      */

      if (
        status !== "all"
      ) {
        ownerWhere.status =
          status;
      }

      /*
      |--------------------------------------------------------------------------
      | Query
      |--------------------------------------------------------------------------
      */

      const {
        count,
        rows,
      } =
        await Owner.findAndCountAll(
          {
            where:
              ownerWhere,

            include: [
              {
                model:
                  License,

                as:
                  "license",
              },
            ],

            attributes: {
              exclude: [
                "password",
              ],
            },

            order: [
              [
                "createdAt",
                "DESC",
              ],
            ],

            limit,

            offset:
              (page - 1) *
              limit,
          }
        );

      return res.json({
        success: true,

        owners:
          rows,

        pagination: {
          page,

          limit,

          total:
            count,

          pages:
            Math.ceil(
              count /
                limit
            ),
        },
      });
    } catch (error) {
      console.error(
        "GET OWNERS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Serverda ichki xatolik yuz berdi",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| BITTA OWNER
|--------------------------------------------------------------------------
*/

router.get(
  "/:id",
  adminAuth,
  async (req, res) => {
    try {
      const owner =
        await Owner.findByPk(
          req.params.id,
          {
            attributes: {
              exclude: [
                "password",
              ],
            },

            include: [
              {
                model:
                  License,

                as:
                  "license",
              },
            ],
          }
        );

      if (!owner) {
        return res.status(404).json({
          success: false,
          message:
            "Owner topilmadi",
        });
      }

      return res.status(200).json({
        success: true,
        owner,
      });
    } catch (error) {
      console.error(
        "GET OWNER ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Serverda ichki xatolik yuz berdi",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| OWNERNI BLOCK QILISH
|--------------------------------------------------------------------------
*/

router.patch(
  "/:id/block",
  adminAuth,
  async (req, res) => {
    try {
      const owner =
        await Owner.findByPk(
          req.params.id
        );

      if (!owner) {
        return res.status(404).json({
          success: false,
          message:
            "Owner topilmadi",
        });
      }

      await owner.update({
        status:
          "blocked",
      });

      await License.update(
        {
          status:
            "blocked",
        },
        {
          where: {
            ownerId:
              owner.id,
          },
        }
      );

      return res.status(200).json({
        success: true,
        message:
          "Owner bloklandi",
      });
    } catch (error) {
      console.error(
        "BLOCK OWNER ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Serverda ichki xatolik yuz berdi",
      });
    }
  }
);

// OWNERNI AKTIV QILISH
// OWNERNI AKTIV QILISH
router.patch(
  "/:id/activate",
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

      const now = new Date();

      const expiresAt = new Date(
        license.expiresAt
      );

      if (
        Number.isNaN(
          expiresAt.getTime()
        )
      ) {
        return res.status(400).json({
          success: false,
          code: "LICENSE_DATE_INVALID",
          message:
            "Litsenziya muddati noto'g'ri",
        });
      }

      // License muddati o'tgan bo'lsa,
      // shunchaki aktiv qilib bo'lmaydi.
      if (expiresAt <= now) {
        return res.status(400).json({
          success: false,
          code: "LICENSE_EXPIRED",
          message:
            "Litsenziya muddati tugagan. Avval litsenziyani uzaytiring.",
          expiresAt: license.expiresAt,
        });
      }

      await owner.update({
        status: "active",
      });

      await license.update({
        status: "active",
      });

      return res.status(200).json({
        success: true,
        message: "Owner aktiv qilindi",

        owner: {
          id: owner.id,
          status: owner.status,
        },

        license: {
          id: license.id,
          status: license.status,
          expiresAt: license.expiresAt,
        },
      });
    } catch (error) {
      console.error(
        "ACTIVATE OWNER ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| LICENSE UZAYTIRISH
|--------------------------------------------------------------------------
*/

router.patch(
  "/:id/extend-license",
  adminAuth,
  async (req, res) => {
    try {
      const {
        expiresAt,
      } = req.body;

      if (!expiresAt) {
        return res.status(400).json({
          success: false,
          message:
            "expiresAt majburiy",
        });
      }

      const owner =
        await Owner.findByPk(
          req.params.id
        );

      if (!owner) {
        return res.status(404).json({
          success: false,
          message:
            "Owner topilmadi",
        });
      }

      const license =
        await License.findOne({
          where: {
            ownerId:
              owner.id,
          },
        });

      if (!license) {
        return res.status(404).json({
          success: false,
          message:
            "License topilmadi",
        });
      }

      const newExpireDate =
        new Date(
          `${expiresAt}T23:59:59`
        );

      if (
        isNaN(
          newExpireDate.getTime()
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Litsenziya tugash sanasi noto'g'ri",
        });
      }

      const today =
        new Date();

      today.setHours(
        0,
        0,
        0,
        0
      );

      if (
        newExpireDate <=
        today
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Litsenziya tugash sanasi bugundan keyin bo'lishi kerak",
        });
      }

      await license.update({
        expiresAt:
          newExpireDate,

        status:
          "active",
      });

      await owner.update({
        status:
          "active",
      });

      return res.status(200).json({
        success: true,

        message:
          "License yangilandi",

        license,
      });
    } catch (error) {
      console.error(
        "EXTEND LICENSE ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Serverda ichki xatolik yuz berdi",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| OWNERNI TAHRIRLASH
|--------------------------------------------------------------------------
*/

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

      /*
      |--------------------------------------------------------------------------
      | Majburiy fieldlar
      |--------------------------------------------------------------------------
      */

      if (
        !companyName ||
        !username ||
        !phone ||
        !address
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Korxona nomi, username, telefon va manzil majburiy",
        });
      }

      const owner =
        await Owner.findByPk(
          req.params.id
        );

      if (!owner) {
        return res.status(404).json({
          success: false,
          message:
            "Owner topilmadi",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | Username unique
      |--------------------------------------------------------------------------
      */

      if (
        username !==
        owner.username
      ) {
        const existing =
          await Owner.findOne({
            where: {
              username,

              id: {
                [Op.ne]:
                  owner.id,
              },
            },
          });

        if (existing) {
          return res.status(409).json({
            success: false,
            message:
              "Username band",
          });
        }
      }

      /*
      |--------------------------------------------------------------------------
      | Phone unique
      |--------------------------------------------------------------------------
      */

      if (
        phone !==
        owner.phone
      ) {
        const existingPhone =
          await Owner.findOne({
            where: {
              phone,

              id: {
                [Op.ne]:
                  owner.id,
              },
            },
          });

        if (existingPhone) {
          return res.status(409).json({
            success: false,
            message:
              "Bu telefon raqami band",
          });
        }
      }

      /*
      |--------------------------------------------------------------------------
      | Update
      |--------------------------------------------------------------------------
      */

      await owner.update({
        companyName:
          companyName.trim(),

        username:
          username.trim(),

        phone:
          phone.trim(),

        address:
          address.trim(),
      });

      return res.json({
        success: true,

        message:
          "Owner yangilandi",

        owner,
      });
    } catch (error) {
      console.error(
        "UPDATE OWNER ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Serverda ichki xatolik yuz berdi",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| OWNERNI O'CHIRISH
|--------------------------------------------------------------------------
*/

router.delete(
  "/:id",
  adminAuth,
  async (req, res) => {
    try {
      const owner =
        await Owner.findByPk(
          req.params.id
        );

      if (!owner) {
        return res.status(404).json({
          success: false,
          message:
            "Owner topilmadi",
        });
      }

      await License.destroy({
        where: {
          ownerId:
            owner.id,
        },
      });

      await owner.destroy();

      return res.json({
        success: true,

        message:
          "Owner o'chirildi",
      });
    } catch (error) {
      console.error(
        "DELETE OWNER ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Serverda ichki xatolik yuz berdi",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| OWNER PAROLINI O'ZGARTIRISH
|--------------------------------------------------------------------------
*/

router.patch(
  "/:id/reset-password",
  adminAuth,
  async (req, res) => {
    try {
      const {
        password,
      } = req.body;

      if (!password) {
        return res.status(400).json({
          success: false,
          message:
            "Yangi parol kerak",
        });
      }

      if (
        password.length <
        6
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Parol kamida 6 ta belgidan iborat bo'lishi kerak",
        });
      }

      const owner =
        await Owner.findByPk(
          req.params.id
        );

      if (!owner) {
        return res.status(404).json({
          success: false,
          message:
            "Owner topilmadi",
        });
      }

      const hash =
        await bcrypt.hash(
          password,
          10
        );

      await owner.update({
        password:
          hash,
      });

      return res.json({
        success: true,

        message:
          "Parol yangilandi",
      });
    } catch (error) {
      console.error(
        "RESET PASSWORD ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Serverda ichki xatolik yuz berdi",
      });
    }
  }
);

module.exports = router;
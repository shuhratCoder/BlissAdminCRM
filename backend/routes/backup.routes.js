const express = require("express");
const crypto = require("crypto");
const zlib = require("zlib");

const router = express.Router();

const OwnerBackup = require("../models/ownerBackup");

const { backupAuth } = require("../middlewares/backupAuth");
const { backupLimiter } = require("../middlewares/rateLimiters");

// Bitta nusxaning eng katta hajmi (siqilgan holda)
const MAX_BACKUP_SIZE = "20mb";

/*
 * Har bir firma uchun jami 2 ta nusxa saqlanadi: bugungi va undan
 * oldingi kunniki. Kun davomida kelgan yangi nusxa bugungisining
 * ustiga yoziladi. Yangi kunning birinchi nusxasi MUVAFFAQIYATLI
 * saqlangandan keyingina eng eskisi o'chiriladi — saqlash xato bersa,
 * hech narsa o'chirilmaydi.
 */
const KEEP_VERSIONS = 2;

const BACKUP_TIME_ZONE =
  process.env.BACKUP_TIME_ZONE || "Asia/Tashkent";

// "2026-11-13" — kun chegarasi firma ishlaydigan vaqt mintaqasida
function dayKey(date) {
  return new Date(date).toLocaleDateString("en-CA", {
    timeZone: BACKUP_TIME_ZONE,
  });
}

function describe(backup) {
  return {
    id: backup.id,
    // Nusxa oxirgi marta yangilangan vaqt
    createdAt: backup.updatedAt,
    day: dayKey(backup.updatedAt),
    sizeBytes: backup.sizeBytes,
    sha256: backup.sha256,
    clientsCount: backup.clientsCount,
    ordersCount: backup.ordersCount,
  };
}

function toCount(value) {
  const number = Number(value);

  return Number.isFinite(number) && number >= 0
    ? Math.min(Math.round(number), 2147483647)
    : 0;
}

/*
|--------------------------------------------------------------------------
| ZAXIRA NUSXANI YUKLASH (desktop -> server)
|--------------------------------------------------------------------------
| Body: gzip qilingan JSON (application/octet-stream).
| Sarlavhalar: x-backup-clients, x-backup-orders (ko'rsatish uchun sonlar).
*/

router.put(
  "/",
  backupLimiter,
  backupAuth,
  express.raw({
    type: "application/octet-stream",
    limit: MAX_BACKUP_SIZE,
  }),
  async (req, res) => {
    try {
      const body = req.body;

      if (!Buffer.isBuffer(body) || body.length === 0) {
        return res.status(400).json({
          success: false,
          code: "BACKUP_EMPTY",
          message: "Zaxira nusxa bo'sh",
        });
      }

      // Buzilgan fayl saqlanib qolmasligi uchun ochib ko'riladi
      try {
        JSON.parse(zlib.gunzipSync(body).toString("utf8"));
      } catch (parseError) {
        return res.status(400).json({
          success: false,
          code: "BACKUP_INVALID",
          message: "Zaxira nusxa formati noto'g'ri",
        });
      }

      const sha256 = crypto
        .createHash("sha256")
        .update(body)
        .digest("hex");

      const values = {
        data: body,
        sizeBytes: body.length,
        sha256,
        clientsCount: toCount(req.headers["x-backup-clients"]),
        ordersCount: toCount(req.headers["x-backup-orders"]),
      };

      const latest = await OwnerBackup.findOne({
        where: { ownerId: req.owner.id },
        attributes: { exclude: ["data"] },
        order: [["updatedAt", "DESC"]],
      });

      // Aynan shu nusxa allaqachon bor: qayta saqlanmaydi
      if (latest && latest.sha256 === sha256) {
        return res.json({
          success: true,
          unchanged: true,
          backup: describe(latest),
        });
      }

      // Bugungi nusxa bor: uning ustiga yoziladi (eskisiga tegilmaydi)
      if (
        latest &&
        dayKey(latest.updatedAt) === dayKey(new Date())
      ) {
        await latest.update(values);

        return res.json({
          success: true,
          unchanged: false,
          replacedToday: true,
          backup: describe(latest),
        });
      }

      // Yangi kun: avval yangi nusxa saqlanadi...
      const backup = await OwnerBackup.create({
        ownerId: req.owner.id,
        ...values,
      });

      // ...va faqat shundan keyin ortiqcha eski nusxalar o'chiriladi.
      const old = await OwnerBackup.findAll({
        where: { ownerId: req.owner.id },
        attributes: ["id"],
        order: [["updatedAt", "DESC"]],
        offset: KEEP_VERSIONS,
      });

      if (old.length > 0) {
        await OwnerBackup.destroy({
          where: { id: old.map((item) => item.id) },
        });
      }

      return res.status(201).json({
        success: true,
        unchanged: false,
        replacedToday: false,
        backup: describe(backup),
      });
    } catch (error) {
      console.error("BACKUP UPLOAD ERROR:", error);

      return res.status(500).json({
        success: false,
        code: "SERVER_ERROR",
        message: error.message,
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| SERVERDAGI NUSXALAR HAQIDA MA'LUMOT
|--------------------------------------------------------------------------
*/

router.get("/info", backupLimiter, backupAuth, async (req, res) => {
  try {
    const versions = await OwnerBackup.findAll({
      where: { ownerId: req.owner.id },
      attributes: { exclude: ["data"] },
      order: [["updatedAt", "DESC"]],
      limit: KEEP_VERSIONS,
    });

    return res.json({
      success: true,
      exists: versions.length > 0,
      latest: versions.length > 0 ? describe(versions[0]) : null,
      versions: versions.map(describe),
    });
  } catch (error) {
    console.error("BACKUP INFO ERROR:", error);

    return res.status(500).json({
      success: false,
      code: "SERVER_ERROR",
      message: error.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| NUSXANI YUKLAB OLISH (server -> desktop)
|--------------------------------------------------------------------------
| ?id=<nusxa id> berilmasa, eng oxirgisi qaytariladi.
*/

router.get("/download", backupLimiter, backupAuth, async (req, res) => {
  try {
    const where = { ownerId: req.owner.id };

    if (req.query.id) {
      where.id = String(req.query.id);
    }

    const backup = await OwnerBackup.findOne({
      where,
      order: [["updatedAt", "DESC"]],
    });

    if (!backup) {
      return res.status(404).json({
        success: false,
        code: "BACKUP_NOT_FOUND",
        message: "Zaxira nusxa topilmadi",
      });
    }

    res.set({
      "Content-Type": "application/octet-stream",
      "Content-Length": String(backup.data.length),
      "X-Backup-Id": backup.id,
      "X-Backup-Created-At": new Date(backup.updatedAt).toISOString(),
      "X-Backup-Sha256": backup.sha256,
    });

    return res.send(backup.data);
  } catch (error) {
    console.error("BACKUP DOWNLOAD ERROR:", error);

    return res.status(500).json({
      success: false,
      code: "SERVER_ERROR",
      message: error.message,
    });
  }
});

module.exports = router;
module.exports.describeBackup = describe;
module.exports.KEEP_VERSIONS = KEEP_VERSIONS;
module.exports.BACKUP_TIME_ZONE = BACKUP_TIME_ZONE;

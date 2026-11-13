const router = require("express").Router();

const Owner = require("../models/owner");
const OwnerBackup = require("../models/ownerBackup");

const adminAuth = require("../middlewares/adminauth");

const {
  describeBackup,
  KEEP_VERSIONS,
  BACKUP_TIME_ZONE,
} = require("./backup.routes");

// Fayl nomi uchun xavfsiz bo'lak (lotin harflari, raqam, chiziqcha)
function safeName(value) {
  return (
    String(value || "")
      .replace(/[^a-zA-Z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "firma"
  );
}

// "2026-11-13_19-27" — firma vaqt mintaqasida
function fileStamp(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BACKUP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(date));

  const get = (type) =>
    parts.find((part) => part.type === type)?.value || "00";

  return `${get("year")}-${get("month")}-${get("day")}_${get("hour")}-${get("minute")}`;
}

/*
|--------------------------------------------------------------------------
| FIRMANING ZAXIRA NUSXALARI RO'YXATI (admin panel)
|--------------------------------------------------------------------------
*/

router.get("/:id/backups", adminAuth, async (req, res) => {
  try {
    const owner = await Owner.findByPk(req.params.id, {
      attributes: ["id", "companyName", "username"],
    });

    if (!owner) {
      return res.status(404).json({
        success: false,
        message: "Owner topilmadi",
      });
    }

    const backups = await OwnerBackup.findAll({
      where: { ownerId: owner.id },
      attributes: { exclude: ["data"] },
      order: [["updatedAt", "DESC"]],
    });

    return res.json({
      success: true,
      owner,
      keepVersions: KEEP_VERSIONS,
      backups: backups.map(describeBackup),
    });
  } catch (error) {
    console.error("ADMIN BACKUP LIST ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Serverda ichki xatolik yuz berdi",
    });
  }
});

/*
|--------------------------------------------------------------------------
| ZAXIRA NUSXANI FAYL QILIB YUKLAB OLISH (admin panel)
|--------------------------------------------------------------------------
| Fayl desktop ilovada "Fayldan tiklash" orqali qayta tiklanadi.
*/

router.get(
  "/:id/backups/:backupId/download",
  adminAuth,
  async (req, res) => {
    try {
      const owner = await Owner.findByPk(req.params.id, {
        attributes: ["id", "companyName", "username"],
      });

      if (!owner) {
        return res.status(404).json({
          success: false,
          message: "Owner topilmadi",
        });
      }

      const backup = await OwnerBackup.findOne({
        where: {
          id: req.params.backupId,
          ownerId: owner.id,
        },
      });

      if (!backup) {
        return res.status(404).json({
          success: false,
          message: "Zaxira nusxa topilmadi",
        });
      }

      const fileName = `bliss-zaxira-${safeName(owner.username)}-${fileStamp(backup.updatedAt)}.blissbak`;

      res.set({
        "Content-Type": "application/octet-stream",
        "Content-Length": String(backup.data.length),
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "X-Backup-File-Name": fileName,
        "Access-Control-Expose-Headers":
          "Content-Disposition, X-Backup-File-Name",
      });

      return res.send(backup.data);
    } catch (error) {
      console.error("ADMIN BACKUP DOWNLOAD ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Serverda ichki xatolik yuz berdi",
      });
    }
  }
);

module.exports = router;

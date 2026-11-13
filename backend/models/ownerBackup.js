const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

/*
 * Desktop CRM (BLISS ERP) ma'lumotlarining siqilgan zaxira nusxasi.
 * data — gzip qilingan JSON (mijozlar, buyurtmalar, to'lovlar).
 * Har bir owner uchun oxirgi bir nechta nusxa saqlanadi.
 */
const OwnerBackup = sequelize.define(
  "OwnerBackup",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    ownerId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    data: {
      type: DataTypes.BLOB,
      allowNull: false,
    },

    sizeBytes: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    sha256: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },

    clientsCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    ordersCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    indexes: [
      {
        fields: ["ownerId", "createdAt"],
      },
    ],
  }
);

module.exports = OwnerBackup;

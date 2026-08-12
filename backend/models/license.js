const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const License = sequelize.define("License", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  ownerId: {
    type: DataTypes.UUID,
    allowNull: false,
  },

  startsAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },

  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },

  status: {
    type: DataTypes.ENUM(
      "active",
      "expired",
      "blocked"
    ),
    allowNull: false,
    defaultValue: "active",
  },
});

module.exports = License;
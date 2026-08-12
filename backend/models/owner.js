const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Owner = sequelize.define("Owner", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  companyName: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },

  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },

  status: {
    type: DataTypes.ENUM(
      "active",
      "blocked"
    ),
    allowNull: false,
    defaultValue: "active",
  },
});

module.exports = Owner;
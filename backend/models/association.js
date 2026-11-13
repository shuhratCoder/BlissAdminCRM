const Owner = require("./owner");
const License = require("./license");
const Admin = require("./admin");

Owner.hasOne(License, {
  foreignKey: "ownerId",
  as: "license",
  onDelete: "CASCADE",
});

License.belongsTo(Owner, {
  foreignKey: "ownerId",
  as: "owner",
});

const OwnerBackup = require("./ownerBackup");

// Owner o'chirilsa, uning zaxira nusxalari ham o'chadi
Owner.hasMany(OwnerBackup, {
  foreignKey: "ownerId",
  as: "backups",
  onDelete: "CASCADE",
});

OwnerBackup.belongsTo(Owner, {
  foreignKey: "ownerId",
  as: "owner",
});

module.exports = {
  Admin,
  Owner,
  License,
  OwnerBackup,
};
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

module.exports = {
  Admin,
  Owner,
  License,
};
import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Queues", "typeChatbot", {
      type: DataTypes.TEXT,
      defaultValue: "",
      allowNull: true
    }),
    queryInterface.addColumn("Queues", "workspaceTypebot", {
      type: DataTypes.TEXT,
      defaultValue: "",
      allowNull: true
    }),
    queryInterface.addColumn("Queues", "typebotId", {
      type: DataTypes.TEXT,
      defaultValue: "",
      allowNull: true
    }),
    queryInterface.addColumn("Queues", "publicId", {
      type: DataTypes.TEXT,
      defaultValue: "",
      allowNull: true
    });
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Queues", "workspaceTypebot"),
    queryInterface.removeColumn("Queues", "typeChatbot"),
    queryInterface.removeColumn("Queues", "publicId"),
    queryInterface.removeColumn("Queues", "typebotId");
  }
};

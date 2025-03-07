import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("QueueOptions", "queueType", {
      type: DataTypes.STRING,
      defaultValue: "text",
      allowNull: false
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("QueueOptions", "queueType");
  }
};
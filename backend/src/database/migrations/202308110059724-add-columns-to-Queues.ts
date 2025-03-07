import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addColumn("Queues", "timeTransbordo", {
        type: DataTypes.INTEGER,
        defaultValue: '0'
      }),
      queryInterface.addColumn("Queues", "transbordoQueueId", {
        type: DataTypes.INTEGER,
        allowNull: true,
      }),
      queryInterface.addColumn("Queues", "messageTransbordo", {
        type: DataTypes.TEXT,
        allowNull: true,
      })
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Queues", "transbordoQueueId"),
      queryInterface.removeColumn("Queues", "timeTransbordo"),
      queryInterface.removeColumn("Queues", "messageTransbordo")
    ]);
  }
};

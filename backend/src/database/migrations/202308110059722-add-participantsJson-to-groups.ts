import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addColumn("Groups", "participantsJson", {
        type: DataTypes.JSONB,
        defaultValue: []
      })
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Groups", "participantsJson"),
    ]);
  }
};

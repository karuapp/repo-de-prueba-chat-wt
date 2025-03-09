import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Schedules", "repeatEvery", {
      type: DataTypes.TEXT,
      defaultValue: null,
      allowNull: true
    }),
    queryInterface.addColumn("Schedules", "repeatCount", {
      type: DataTypes.TEXT,
      defaultValue: null,
      allowNull: true
    }),
    queryInterface.addColumn("Schedules", "selectDaysRecorrenci", {
      type: DataTypes.STRING,
      defaultValue: null,
      allowNull: true
    })
  },
  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn("Schedules", "repeatEvery");
    await queryInterface.removeColumn("Schedules", "repeatCount");
    await queryInterface.removeColumn("Schedules", "selectDaysRecorrenci");
  }
};

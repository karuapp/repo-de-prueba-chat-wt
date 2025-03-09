import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Tickets", "oportunidadeId", {
      type: DataTypes.INTEGER,
      allowNull: true
    })
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Tickets", "oportunidadeId");
  }
};

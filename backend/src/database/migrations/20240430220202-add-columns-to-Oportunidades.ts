import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Oportunidades", "ticketInfo", {
      type: DataTypes.TEXT,
      allowNull: true
    }),
    queryInterface.addColumn("Oportunidades", "tagId", {
      type: DataTypes.INTEGER,
      allowNull: true
    }),
    queryInterface.addColumn("Oportunidades", "ticketId", {
      type: DataTypes.INTEGER,
      allowNull: true
    })
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Oportunidades", "ticketInfo"),
           queryInterface.removeColumn("Oportunidades", "tagId"),
           queryInterface.removeColumn("Oportunidades", "ticketId")
  }
};

import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Tickets", "sessiontypebot", {
      type: DataTypes.TEXT,
      //defaultValue: "",
      allowNull: true
    }),
    queryInterface.addColumn("Tickets", "startChatTime", {
      type: DataTypes.DATE,
      //defaultValue: null,
      allowNull: true
    })
    ;
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Tickets", "sessiontypebot"),
    queryInterface.removeColumn("Tickets", "startChatTime");
  }
};

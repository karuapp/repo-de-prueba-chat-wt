import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Whatsapps", "selectedInterval", {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: "0"      
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Whatsapps", "selectedInterval");
  }
};
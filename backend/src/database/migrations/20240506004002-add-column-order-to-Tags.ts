import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Tags", "order", {
      type: DataTypes.INTEGER,
      allowNull: true
    });
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Tags", "order");
  }
};

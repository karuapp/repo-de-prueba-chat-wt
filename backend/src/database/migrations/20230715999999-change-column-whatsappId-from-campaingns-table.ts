import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    // Step 1: Remove the existing foreign key constraint
    return queryInterface.removeConstraint("Campaigns", "Campaigns_whatsappId_fkey")
      .then(() => {
        // Step 2: Change the data type of whatsappId column
        return queryInterface.changeColumn("Campaigns", "whatsappId", {
          type: DataTypes.STRING,
          allowNull: true
        });
      })
      .catch((error) => {
        console.log("Error in migration: ", error);
        throw error;
      });
  },

  down: (queryInterface: QueryInterface) => {
    // Step 1: Re-add the foreign key constraint
    return queryInterface.changeColumn("Campaigns", "whatsappId", {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "Whatsapps", key: "id" },
      onUpdate: "SET NULL",
      onDelete: "SET NULL"
    })
      .catch((error) => {
        console.log("Error in migration: ", error);
        throw error;
      });
  }
};
import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
    up: (queryInterface: QueryInterface) => {
        return queryInterface.addColumn("Ratings", "geral", {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        });
    },

    down: (queryInterface: QueryInterface) => {
        return queryInterface.removeColumn("Ratings", "geral");
    }
};

import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("Oportunidades", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      companyId: {
        type: DataTypes.INTEGER,
        references: { model: "Companies", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      funil: {
        type: DataTypes.STRING,
        allowNull: true
      },
      etapadofunil: {
        type: DataTypes.STRING,
        allowNull: true
      },
      fonte: {
        type: DataTypes.STRING,
        allowNull: true
      },
      campanha: {
        type: DataTypes.STRING,
        allowNull: true
      },
      datadeida: {
        type: DataTypes.STRING,
        allowNull: true
      },
      datadevolta: {
        type: DataTypes.STRING,
        allowNull: true
      },
      origem: {
        type: DataTypes.STRING,
        allowNull: true
      },
      destino: {
        type: DataTypes.STRING,
        allowNull: true
      },
      valor: {
        type: DataTypes.STRING,
        allowNull: true
      },
      produto: {
        type: DataTypes.STRING,
        allowNull: true
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      createdAt: {
        type: DataTypes.DATE(6),
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE(6),
        allowNull: false
      }
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("Oportunidades");
  }
};

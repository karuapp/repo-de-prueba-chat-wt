'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('Schedules', 'mediaPath', {
        type: Sequelize.TEXT,
        allowNull: true,
      }),
      queryInterface.addColumn('Schedules', 'mediaName', {
        type: Sequelize.TEXT,
        allowNull: true,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('Schedules', 'mediaPath'),
      queryInterface.removeColumn('Schedules', 'mediaName'),
    ]);
  },
};

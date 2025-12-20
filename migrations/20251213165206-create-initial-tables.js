"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. SERVICES Table
    await queryInterface.createTable("services", {
      service_id: { type: Sequelize.STRING(10), primaryKey: true },
      name: { type: Sequelize.STRING(50), allowNull: false },
      avg_duration_minutes: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 5,
      },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    // 2. COUNTERS Table
    await queryInterface.createTable("counters", {
      counter_id: { type: Sequelize.INTEGER, primaryKey: true },
      name: { type: Sequelize.STRING(50), allowNull: false },
      // Using PostgreSQL's native array type for supported services!
      supported_service_ids: {
        type: Sequelize.ARRAY(Sequelize.STRING(10)),
        allowNull: false,
      },
      is_open: { type: Sequelize.BOOLEAN, defaultValue: false },
      operator_name: { type: Sequelize.STRING(100) },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    // 3. TOKEN_HISTORY Table
    await queryInterface.createTable("token_history", {
      token_id: { type: Sequelize.STRING(15), primaryKey: true },

      service_id: {
        // Foreign Key to services
        type: Sequelize.STRING(10),
        references: { model: "services", key: "service_id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false,
      },

      assigned_counter_id: {
        // Foreign Key to counters
        type: Sequelize.INTEGER,
        references: { model: "counters", key: "counter_id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false,
      },

      status: { type: Sequelize.STRING(20), allowNull: false },
      generation_timestamp: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("NOW()"),
      },
      called_timestamp: { type: Sequelize.DATE },
      served_timestamp: { type: Sequelize.DATE },
      skip_count: { type: Sequelize.INTEGER, defaultValue: 0 },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Drop tables in reverse order to respect foreign key constraints
    await queryInterface.dropTable("token_history");
    await queryInterface.dropTable("counters");
    await queryInterface.dropTable("services");
  },
};

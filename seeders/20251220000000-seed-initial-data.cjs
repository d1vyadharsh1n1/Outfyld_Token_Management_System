"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Insert initial services
    await queryInterface.bulkInsert("services", [
      {
        service_id: "DEP",
        name: "Deposit",
        avg_duration_minutes: 5,
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        service_id: "WDL",
        name: "Withdrawal",
        avg_duration_minutes: 7,
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        service_id: "TRF",
        name: "Transfer",
        avg_duration_minutes: 10,
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        service_id: "ACC",
        name: "Account Inquiry",
        avg_duration_minutes: 3,
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        service_id: "LOAN",
        name: "Loan Application",
        avg_duration_minutes: 20,
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // Insert initial counters
    await queryInterface.bulkInsert("counters", [
      {
        counter_id: 1,
        name: "Counter 1",
        supported_service_ids: ["DEP", "WDL", "TRF", "ACC"],
        is_open: true,
        operator_name: "John Doe",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        counter_id: 2,
        name: "Counter 2",
        supported_service_ids: ["DEP", "WDL", "TRF"],
        is_open: true,
        operator_name: "Jane Smith",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        counter_id: 3,
        name: "Counter 3",
        supported_service_ids: ["ACC", "LOAN"],
        is_open: true,
        operator_name: "Bob Johnson",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove seeded data
    await queryInterface.bulkDelete("counters", null, {});
    await queryInterface.bulkDelete("services", null, {});
  },
};

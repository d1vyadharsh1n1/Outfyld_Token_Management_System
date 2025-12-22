import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import Service from "./Service.js";
import Counter from "./Counter.js";

const TokenHistory = sequelize.define(
  "TokenHistory",
  {
    token_id: {
      type: DataTypes.STRING(15),
      primaryKey: true,
      allowNull: false,
    },
    service_id: {
      type: DataTypes.STRING(10),
      allowNull: false,
      references: {
        model: "services",
        key: "service_id",
      },
    },
    assigned_counter_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "counters",
        key: "counter_id",
      },
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "pending",
    },
    generation_timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    called_timestamp: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    served_timestamp: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    skip_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: "token_history",
    timestamps: true,
  }
);

// Define associations
TokenHistory.belongsTo(Service, {
  foreignKey: "service_id",
  as: "service",
});

TokenHistory.belongsTo(Counter, {
  foreignKey: "assigned_counter_id",
  as: "counter",
});

export default TokenHistory;

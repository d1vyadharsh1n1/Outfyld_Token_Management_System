import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Counter = sequelize.define(
  "Counter",
  {
    counter_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    supported_service_ids: {
      type: DataTypes.ARRAY(DataTypes.STRING(10)),
      allowNull: false,
    },
    is_open: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    operator_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  },
  {
    tableName: "counters",
    timestamps: true,
  }
);

export default Counter;

import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const Applications = sequelize.define("Applications", {
  applicationId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "projects", 
      key: "projectId"
    },
    onDelete: "CASCADE"
  },
  freelancerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "freelancers",
      key: "freelancerId"
    },
    onDelete: "CASCADE"
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [10, 5000]
    }
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: "pending",
    validate: {
      isIn: [["pending", "accepted", "rejected"]]
    }
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: "applications",
  timestamps: false
});

Applications.associate = (models) => {
  Applications.belongsTo(models.Projects, { foreignKey: "projectId", as: "project" });
  Applications.belongsTo(models.Freelancers, { foreignKey: "freelancerId", as: "freelancer" });
};

export default Applications;

import dotenv from "dotenv";
import { Sequelize } from "sequelize";
dotenv.config();
let LOGGING = false;
if (process.env.DEVELOPMENT == 'true') { LOGGING = true; }

// >>> Database Config
const db = new Sequelize(
   process.env.SQL_DB_NAME,
   process.env.SQL_DB_USER,
   process.env.SQL_DB_PASSWORD,
  {
    host: process.env.SQL_HOST,
    port: process.env.SQL_PORT,
    dialect: "mssql",
    logging: LOGGING,
    pool: {
      max: 10,
      min: 0,
      idle: 10000,
      acquire: 10000,
      requestTimeout: 300000,
    },
    define: {
      freezeTableName: true
    },
  }
);

export default db;
const { Sequelize } = require("sequelize");
const fs = require("fs");

const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASSWORD,
  {
    host: process.env.MYSQL_HOST,
    dialect: "mysql",
    port: process.env.MYSQL_PORT || 4000,
    logging: console.log,
    dialectOptions: {
      ssl: {
        rejectUnauthorized: true,
        ca: fs.readFileSync("/etc/ssl/cert.pem", "utf8"),
      },
      connectTimeout: 60000,
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 60000,
      idle: 10000,
    },
  }
);

const connectDB = async () => {
  try {
    console.log("Attempting to connect to the database...");
    console.log(`Host: ${process.env.MYSQL_HOST}`);
    console.log(`Port: ${process.env.MYSQL_PORT || 4000}`);
    console.log(`Database: ${process.env.MYSQL_DATABASE}`);

    await sequelize.authenticate();
    console.log("Connection has been established successfully.");

    await sequelize.sync({ alter: true });
    console.log("All models were synchronized successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    if (error.parent) {
      console.error("Parent error:", error.parent.message);
      console.error("Error code:", error.parent.code);
    }
    console.error("Full error object:", JSON.stringify(error, null, 2));
  }
};

module.exports = { connectDB, sequelize };

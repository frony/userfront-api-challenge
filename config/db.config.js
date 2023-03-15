"use strict";

require("./env/dotenv.js");

module.exports = {
  test: {
    database: process.env.DATABASE_NAME || "api_challenge",
    username: process.env.DATABASE_USERNAME || "postgres",
    password: process.env.DATABASE_PASSWORD || null,
    host: process.env.DATABASE_HOST || "localhost",
    dialect: process.env.DATABASE_DIALECT || "postgres",
    port: process.env.DATABASE_PORT || 5432,
  },
  production: {
    database: process.env.DATABASE_NAME || "api_challenge",
    username: process.env.DATABASE_USERNAME || "postgres",
    password: process.env.DATABASE_PASSWORD || null,
    host: process.env.DATABASE_HOST || "localhost",
    dialect: process.env.DATABASE_DIALECT || "postgres",
    port: process.env.DATABASE_PORT || 5432,
  }
};

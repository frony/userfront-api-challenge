"use strict";

require("./env/dotenv.js");

module.exports = {
  test: {
    database: "api_challenge",
    username: "mfrony",
    // username: process.env.DATABASE_USERNAME || "postgres",
    password: "R10D3J@n31r0!1",
    host: "localhost",
    dialect: "postgres",
    port: 5432,
  },
};

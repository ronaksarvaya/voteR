require("dotenv").config();
const serverless = require("serverless-http");
const app = require("../app"); // make sure path is correct

module.exports = serverless(app);

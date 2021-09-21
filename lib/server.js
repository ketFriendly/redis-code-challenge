const express = require("express");
require("dotenv").config();
const { addBuyer, getBuyer, routeTraffic } = require("../src/controllers/buyers.controller");

module.exports = function createServer() {
  const app = express();

  app.use(express.json());
  const port = process.env.PORT || 8080;

  app.route("/buyers").post(addBuyer);
  app.route("/buyers/:id").get(getBuyer);
  app.route("/route").get(routeTraffic);

  app.listen(port, () => {
    console.info("Server is running on", port);
  });
};

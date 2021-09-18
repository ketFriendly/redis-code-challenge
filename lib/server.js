const express = require("express");

module.exports = function createServer() {
  const app = express();

  app.use(express.json());
  const port = process.env.PORT || 8080;

  app.route("/buyers").post();
  app.route("/buyers/:id").get();
  app.route("/route").get();

  app.listen(port, () => {
    console.info("Server is running on", port);
  });
};


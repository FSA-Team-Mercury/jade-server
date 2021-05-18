const { db } = require("./db");
require("dotenv").config();
const app = require("./api");
const http = require("http");
const PORT = process.env.PORT || 3000;

const httpServer = http.createServer(app);
db.sync() // if you update your db schemas, make sure you drop the tables first and then recreate them
  .then(() => {
    console.log("db synced");
    httpServer.listen(PORT, () =>
      console.log(`Express server listening at PORT ${PORT}`)
    );
  });

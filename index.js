require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

require("./start/db")();

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

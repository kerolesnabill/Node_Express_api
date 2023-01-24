const mongoose = require("mongoose");
const db = process.env.DATABASE;

module.exports = () => {
  if (!db) throw new Error("Database URL not found!");
  mongoose.connect(db).then(() => console.log("Connected to database..."));
};

const mongoose = require("mongoose");
require("dotenv").config({ path: "./config/.env" });

const mongodburl = process.env.MONGODB_URL;

mongoose.connect(mongodburl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("error", (err) => {
  console.log("Connection failed");
});
mongoose.connection.on("connected", (connected) => {
  console.log("Connected with database ");
});
// assignment
// iitjodhpur
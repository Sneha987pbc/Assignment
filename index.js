const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const user = require("./routes/userRoutes");
const product = require("./routes/productRoutes.js")
const order = require("./routes/orderRoutes.js")
require("./connect.js");

const app = express();
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// Handling Uncaught Exception
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down the server due to Uncaught Exception`);
  process.exit(1);
});

// Config

  require("dotenv").config({ path: "./config/.env" });


app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Replaced bodyParser with express.urlencoded
app.use(cookieParser());

app.use("/api", user);
app.use("/api",product);
app.use("/api",order);

PORT = process.env.PORT || 9000
app.listen(PORT, ()=> console.log(`Server Started on port no. ${PORT}`));


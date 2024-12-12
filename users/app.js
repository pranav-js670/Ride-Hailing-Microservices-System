const express = require("express");
const userRoutes = require("./routes/user.routes");
const dotenv = require("dotenv");
dotenv.config();
const cookieParser = require("cookie-parser");
const connect = require("./db/db");
connect();
const app = express();
const rabbit = require("./service/rabbit");
rabbit.connect();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/", userRoutes);

module.exports = app;

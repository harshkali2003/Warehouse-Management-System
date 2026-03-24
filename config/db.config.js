const mongoose = require("mongoose");
require("dotenv").config();

const URL = process.env.MONGODB_URL;

const connectDB = async () => {
  try {
    await mongoose.connect(URL, () => {
    console.log("Connected");
    });
  } catch (err) {
    console.error("Error while connecting", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
const mongoose = require("mongoose");
const initdata = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wonderlust";

// Connect to MongoDB
async function main() {
  await mongoose.connect(MONGO_URL);
}

main()
  .then(() => {
    console.log("Connected to DB");
    initDB();
  })
  .catch((err) => {
    console.log(err);
  });

// Initialize Database
const initDB = async () => {
  await Listing.deleteMany({});

  const newData = initdata.data.map((obj) => ({
    ...obj,
    owner: "69aecfee8c950a556c135f07"
  }));

  await Listing.insertMany(newData);

  console.log("Data was initialized");
};
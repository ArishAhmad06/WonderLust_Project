require("dotenv").config();

const mongoose = require("mongoose");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");

const geocodingClient = mbxGeocoding({ accessToken: process.env.MAP_TOKEN });

async function geocode(query) {
  const res = await geocodingClient.forwardGeocode({ query, limit: 1 }).send();
  return res.body.features[0]?.geometry;
}

const initDB = async () => {
  // Seed listings need an owner: use the first registered user.
  const owner = await User.findOne();
  if (!owner) {
    throw new Error("No users found. Sign up once in the app, then run the seed again.");
  }

  const docs = [];
  for (const obj of initData.data) {
    try {
      const geometry = await geocode(`${obj.location}, ${obj.country}`);
      if (!geometry) throw new Error("no geocoding result");
      docs.push({ ...obj, owner: owner._id, geometry });
    } catch (err) {
      console.warn(`Skipped "${obj.title}" (${obj.location}): ${err.message}`);
    }
  }

  await Listing.deleteMany({});
  await Listing.insertMany(docs);
  console.log(`Seeded ${docs.length} of ${initData.data.length} listings`);
};

mongoose
  .connect(process.env.MONGO_URL)
  .then(initDB)
  .catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.connection.close());
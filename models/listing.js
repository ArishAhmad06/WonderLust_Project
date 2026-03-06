const mongoose = require("mongoose"); // Importing/Requiring mongoose from package.
const Schema = mongoose.Schema;
const Review = require("./review.js");
const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    filename: {
      type: String,
    },
    url: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1725345653429-8b3926cc229c?w=700&auto=format&fit=crop&q=60",
      set: (v) =>
        v === ""
          ? "https://images.unsplash.com/photo-1725345653429-8b3926cc229c?w=700&auto=format&fit=crop&q=60"
          : v,
    },
  },
  price: Number,
  location: String,
  country: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
});

listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;

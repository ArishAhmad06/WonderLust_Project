const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const mapToken = process.env.MAP_TOKEN;

const geocodingClient = mbxGeocoding({
  accessToken: mapToken,
});

module.exports.index = async (req, res) => {
  const { q = "", category = "all" } = req.query;
  const normalizedCategory = category.toLowerCase();

  const allListings = await Listing.find({}).lean();

  const normalizedListings = allListings
    .map((listing) => ({
      ...listing,
      category: listing.category || "Trending",
    }))
    .filter((listing) => {
      const location = (listing.location || "").toLowerCase();
      const listingCategory = (listing.category || "").toLowerCase();
      const queryText = q.trim().toLowerCase();

      const matchesQuery = !queryText || location.includes(queryText);
      const matchesCategory =
        normalizedCategory === "all" || listingCategory === normalizedCategory;

      return matchesQuery && matchesCategory;
    });
    
  return res.render("listings/index.ejs", {
    allListings: normalizedListings,
    activeCategory: normalizedCategory,
    searchQuery: q,
  });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "The listing you are looking for does not exist!");
    return res.redirect("/listings");
  }

  await listing.populate({ path: "reviews", populate: { path: "author" } });
  await listing.populate("owner");

  console.log("Geometry:", listing.geometry);
  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res) => {
  if (!req.file) {
    throw new ExpressError(400, "Please upload a Listing image");
  }

  const newListing = new Listing(req.body.listing);
  const { path: url, filename } = req.file;
  newListing.owner = req.user._id;
  newListing.image = { url, filename };

  try {
    let response = await geocodingClient
      .forwardGeocode({
        query: newListing.location,
        limit: 1,
      })
      .send();

    newListing.geometry = response.body.features[0].geometry;
  } catch (err) {
    console.error("Geocoding error:", err);
    throw new ExpressError(
      400,
      "Geocoding failed: Unable to retrieve coordinates for the provided location.",
    );
  }

  await newListing.save();
  req.flash("success", "New listing added successfully!");
  return res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found");

    return res.redirect("/listings");
  }
  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300");

  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(
    id,
    { ...req.body.listing },
    { new: true },
  );

  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  if (req.file) {
    const { path: url, filename } = req.file;
    listing.image = { url, filename };
  }

  if (req.body.listing.location) {
    try {
      let response = await geocodingClient
        .forwardGeocode({
          query: req.body.listing.location,
          limit: 1,
        })
        .send();

      listing.geometry = response.body.features[0].geometry;
    } catch {
      req.flash(
        "error",
        "Geocoding failed: No results found for the provided location.",
      );
    }
  }

  await listing.save();
  req.flash("success", "Listing updated successfully!");
  return res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing deleted successfully!");
  return res.redirect("/listings");
};

const Listing = require("../models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const mapToken = process.env.MAP_TOKEN;

const geocodingClient = mbxGeocoding({
  accessToken: mapToken,
});

const ExpressError = require("../Utils/ExpressError");

// ================= INDEX =================
module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

// ================= NEW =================
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

// ================= SHOW =================
module.exports.showListing = async (req, res) => {
  let { id } = req.params;

  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  res.render("listings/show.ejs", { listing });
};

// ================= CREATE =================
module.exports.createListing = async (req, res) => {

  // geocoding
  let response = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send();

  // uploaded image
  let { path: url, filename } = req.file;

  // create listing
  const newListing = new Listing(req.body.listing);

  // save image
  newListing.image = {
    url,
    filename,
  };

  // save geometry
  newListing.geometry = response.body.features[0].geometry;

  // owner
  newListing.owner = req.user._id;

  // save listing
  let savedListing = await newListing.save();

  console.log(savedListing);

  req.flash("success", "Successfully made a new listing!");

  res.redirect(`/listings/${newListing._id}`);
};

// ================= EDIT =================
module.exports.renderEditForm = async (req, res) => {

  let { id } = req.params;

  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  res.render("listings/edit.ejs", { listing });
};

// ================= UPDATE =================
module.exports.updateListing = async (req, res) => {

  let { id } = req.params;

  const listing = await Listing.findById(id);

  if (!listing) {
    throw new ExpressError(404, "Listing not found!");
  }

  // update fields
  Object.assign(listing, req.body.listing);

  // update image if uploaded
  if (req.file) {

    let { path: url, filename } = req.file;

    listing.image = {
      url,
      filename,
    };
  }

  await listing.save();

  req.flash("success", "Successfully updated listing!");

  res.redirect(`/listings/${id}`);
};

// ================= DELETE =================
module.exports.deleteListing = async (req, res) => {

  let { id } = req.params;

  const deletedListing = await Listing.findByIdAndDelete(id);

  if (!deletedListing) {
    throw new ExpressError(404, "Listing not found!");
  }

  req.flash("success", "Successfully deleted listing!");

  res.redirect("/listings");
};
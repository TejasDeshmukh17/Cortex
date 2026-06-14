const express = require("express");
const router = express.Router();
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

const wrapAsync = require("../Utils/wrapAsync.js");
const ExpressError = require("../Utils/ExpressError.js");
const { listingSchema } = require("../schema.js");

const ListingController = require("../controllers/listings.js");

const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

// ✅ middleware
const { isLoggedIn, isOwner } = require("../middleware.js");

// ================= VALIDATION =================
const validateListing = (req, res, next) => {

  let { error } = listingSchema.validate(req.body);

  if (error) {
    let errorMessage = error.details.map(el => el.message).join(",");
    throw new ExpressError(400, errorMessage);
  }

  next();
};
// ================= ROUTES =================
router
  .route("/")
  .get(wrapAsync(ListingController.index))
  .post(
    isLoggedIn,
   upload.single("image"),
    validateListing,
    wrapAsync(ListingController.createListing)
  );

// ================= NEW ROUTE =================
router.get("/new", isLoggedIn, ListingController.renderNewForm);

// ================= SHOW / UPDATE / DELETE =================
router
  .route("/:id")
  .get(wrapAsync(ListingController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"), // 🔥 FIX ADDED HERE
    validateListing,
    wrapAsync(ListingController.updateListing)
  )
  .delete(
    isLoggedIn,
    isOwner,
    wrapAsync(ListingController.deleteListing)
  );

// ================= EDIT =================
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(ListingController.renderEditForm)
);

module.exports = router;
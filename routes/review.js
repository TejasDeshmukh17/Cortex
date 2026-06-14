const express = require("express");
const router = express.Router({ mergeParams: true });

const wrapAsync = require("../Utils/wrapAsync.js");
const ExpressError = require("../Utils/ExpressError.js");
const { reviewSchema } = require("../schema.js");

const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

const reviewController = require("../controllers/reviews.js");
// ✅ import middleware
const { isLoggedIn, isReviewAuthor } = require("../middleware.js");

// ================= VALIDATION =================
const validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);

  if (error) {
    let errorMessage = error.details.map(el => el.message).join(",");
    throw new ExpressError(400, errorMessage);
  } else {
    next();
  }
};

// ================= CREATE REVIEW =================
router.post(
  "/",
  isLoggedIn,   // ✅ must login
  validateReview,
  wrapAsync(reviewController.createReview)
);

// ================= DELETE REVIEW =================
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,   // ✅ authorization added
  wrapAsync(reviewController.destroyReview)
);

module.exports = router;
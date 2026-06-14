const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

module.exports.createReview = async (req, res) => {
  let listing = await Listing.findById(req.params.id);

  // 🔥 Extract values
  let { rating, comment } = req.body.review;

  // ✅ FIX: default rating = 1 if empty
  rating = rating === "" ? 1 : Number(rating);

  // ✅ Create review safely
  let newReview = new Review({
    comment,
    rating,
    author: req.user._id,
  });

  listing.reviews.push(newReview);

  await newReview.save();
  await listing.save();

  req.flash("success", "Successfully added a new review!");
  res.redirect(`/listings/${listing._id}`);
};

module.exports.destroyReview = async (req, res) => {
  let { id, reviewId } = req.params;

  await Listing.findByIdAndUpdate(id, {
    $pull: { reviews: reviewId },
  });

  await Review.findByIdAndDelete(reviewId);

  req.flash("success", "Successfully deleted a review!");
  res.redirect(`/listings/${id}`);
};
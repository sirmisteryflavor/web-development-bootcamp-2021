const express = require('express');
const router = express.Router({ mergeParams: true });

const Campground = require('../models/campground');
const Review = require('../models/review');

const {isLoggedIn} = require('../middleware');
const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');

const { reviewSchema } = require('../schemas')

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(', ')
        throw new ExpressError(msg, 400)
    } else { 
        next()
    }
};

router.post('/', isLoggedIn, validateReview, catchAsync(async (req, res, next) => {
    // res.send('This is working!')
    const { id } = req.params;
    const campground = await Campground.findById(id);
    const { rating, body } = req.body.review;
    const review = new Review({ rating, body });

    // req.user is added automatically via passport.
    review.author = req.user._id;
    // TODO: what does "push" do?
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Created a new review!')
    res.redirect(`/campgrounds/${id}`)
}));

router.delete('/:reviewId', isLoggedIn, catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    // Remove from array -> take the 
    await Campground.findByIdAndUpdate(id, { $pull: {reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review!')
    res.redirect(`/campgrounds/${id}`)
}));

module.exports = router;
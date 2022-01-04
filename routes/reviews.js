const express = require('express');
const router = express.Router({ mergeParams: true });
const ctrlReview = require('../controller/reviews')
const { isLoggedIn, validateReview, isReviewAuthor } = require('../middleware');
const catchAsync = require('../utils/catchAsync');


router.post('/', 
    isLoggedIn, 
    validateReview, 
    catchAsync(ctrlReview.createReview)
);

router.delete('/:reviewId', 
    isLoggedIn, 
    isReviewAuthor, 
    catchAsync(ctrlReview.deleteReviewId)
);

module.exports = router;
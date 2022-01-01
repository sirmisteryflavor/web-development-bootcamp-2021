const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { campgroundSchema } = require('../schemas');
const ObjectID = require('mongoose').Types.ObjectId;
const {isLoggedIn} = require('../middleware')

const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const Review = require('../models/review');


const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(', ')
        throw new ExpressError(msg, 400)
    } else { 
        next()
    }
};

router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds})
}));
 
// order matters -> this has to be before /:id or else it will think 'new' is 
// an id!
router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new')
})

router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    // req.user is added automatically via passport.
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Successfully made a new campground!')
    res.redirect(`/campgrounds/${campground._id}`)
}));

router.get('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    if(req.user) {
        const sessionUser = req.user._id;
        console.log(sessionUser);
    }
    
    if(!ObjectID.isValid(id)) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds') 
    }
    // 
    const campground = await Campground.findById(req.params.id).populate('reviews').populate('author') 

    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds') 
    } 
    else {
        for (const review in campground.reviews) {
            const enrichedReview = await Review.findById(review._id).populate('author')
            console.log("Before print review")
            console.log(enrichedReview)
            console.log("After print review")
        }
    }
    console.log(campground);
    res.render('campgrounds/show', { campground });
}));

router.get('/:id/edit', isLoggedIn, catchAsync(async(req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', { campground });
}));

router.put('/:id', isLoggedIn, validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    req.flash('success', 'Successfully updated campground!')
    res.redirect(`/campgrounds/${campground._id}`)
}));

router.delete('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground!')
    res.redirect('/campgrounds');
}));

module.exports = router
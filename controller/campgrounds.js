const Campground = require('../models/campground');
const ObjectID = require('mongoose').Types.ObjectId;

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds})
};

module.exports.renderNewCampgroundForm = (req, res) => {
    res.render('campgrounds/new')
};

module.exports.createNewCampground = async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    // () is implicit return
    campground.images = req.files.map(f => ({url: f.path, filename: f.filename}))    
    // req.user is added automatically via passport.
    campground.author = req.user._id;
    await campground.save();
    console.log(campground);
    req.flash('success', 'Successfully made a new campground!')
    res.redirect(`/campgrounds/${campground._id}`)
};

module.exports.renderCampgroundId = async (req, res) => {
    const { id } = req.params;
    if(req.user) {
        const sessionUser = req.user._id;
    }
    
    if(!ObjectID.isValid(id)) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds') 
    }
    
    const campground = await Campground.findById(req.params.id).populate({
        // Nested .populate() method
        // Food For Thought: if this campground had a lot of reviews, we would 
        // limit the reviews displayed.
        path: 'reviews',
        populate: {
            path: 'author'
        }    
    }).populate('author') 

    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds') 
    } 
    res.render('campgrounds/show', { campground });
};

module.exports.renderEditCampgroundForm = async(req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', { campground });
};

module.exports.updateCampgroundId = async (req, res) => {
    const { id } = req.params;
    // const campground = await Campground.findById(id);
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that')
        return res.redirect(`/campgrounds/${id}`);
    }
    await campground.save();
    return res.redirect(`/campgrounds/${id}`);
};

module.exports.deleteCampgroundId = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground!')
    res.redirect('/campgrounds');
};
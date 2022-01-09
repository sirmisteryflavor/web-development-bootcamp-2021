const Campground = require('../models/campground');
const ObjectID = require('mongoose').Types.ObjectId;
const { cloudinary } = require("../cloudinary");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds})
};

module.exports.renderNewCampgroundForm = (req, res) => {
    res.render('campgrounds/new')
};

module.exports.createNewCampground = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query:req.body.campground.location,
        limit: 1
    }).send()
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    // () is implicit return
    campground.images = req.files.map(f => ({url: f.path, filename: f.filename}));    
    // req.user is added automatically via passport.
    campground.author = req.user._id;
    await campground.save();
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
    console.log(req.body)
    // const campground = await Campground.findById(id);
    // ... is a spread operator that unnests an array
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const imgs = req.files.map(f => ({url: f.path, filename: f.filename}));

    
    if (req.body.deleteImages) {
        // deletes from cloudinary
        for(let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        // Mongo query to delete images
        await campground.updateOne({ 
            // $pull extracts from an array
            $pull: { 
                images: { 
                    filename: { 
                        $in: req.body.deleteImages
                    }
                }
            }
        })
    }
    console.log(campground)
    // Pushes onto the existing images
    campground.images.push(...imgs);
    await campground.save();
    req.flash('success', 'Successfully updated campground!');
    return res.redirect(`/campgrounds/${id}`);
};

module.exports.deleteCampgroundId = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground!')
    res.redirect('/campgrounds');
};
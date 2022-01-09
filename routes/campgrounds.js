const express = require('express');
const router = express.Router();
const ctrlCampground = require('../controller/campgrounds')
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware')
// File uploads.
const multer  = require('multer');
// Determines upload destination
const { storage } = require('../cloudinary');
const upload = multer( { storage } );

router.route('/')
    .get(catchAsync(ctrlCampground.index))
    .post(
    isLoggedIn, 
    // molter has the body content so this has to run before the validation
    // which is not ideal. In production, we would validate before uploading.
    upload.array('image'),
    validateCampground, 
    catchAsync(ctrlCampground.createNewCampground))
             
// order matters -> this has to be before /:id or else it will think 'new' is 
// an id!
router.get('/new', 
    isLoggedIn, 
    ctrlCampground.renderNewCampgroundForm)

router.route('/:id')
    .get(catchAsync(ctrlCampground.renderCampgroundId))
    .put(
        isLoggedIn,
        isAuthor,
        upload.array('image'),  
        validateCampground, 
        catchAsync(ctrlCampground.updateCampgroundId)
    )
    .delete(
        isLoggedIn, 
        catchAsync(ctrlCampground.deleteCampgroundId)
    );

router.get('/:id/edit', 
    isAuthor, 
    isLoggedIn, 
    catchAsync(ctrlCampground.renderEditCampgroundForm));

module.exports = router
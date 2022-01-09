const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review')

const ImageSchema = new Schema({
    url: String,
    filename: String
});

// Method that returns the modified string of the url.
ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200')
})

const CampgroundSchema = new Schema({
    title: String,
    images: [ ImageSchema ],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});


// mongoose query middleware the removes reviews when we delete campground.
// NOTE: this is only triggered when certain actions are taken. i.e. campground.findByIdAndDelete in app.js
CampgroundSchema.post('findOneAndDelete', async function(doc) {
    if(doc){
        await Review.deleteMany({
            // delete all id fields where their id fields are in 
            // the document array.
            _id: {
                $in: doc.reviews
            }
        })
    }
})


// Exporting this function allows other modules to use it. For example in app.js.
module.exports = mongoose.model('Campground', CampgroundSchema);


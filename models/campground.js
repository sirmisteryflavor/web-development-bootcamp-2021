const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review')

const CampgroundSchema = new Schema({
    title: String,
    image: String,
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


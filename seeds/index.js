const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    // This deletes all campground schemas
    await Campground.deleteMany({});
    for(let i = 0; i < 50; i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 30) + 10;
        camp = new Campground ({
            // YOUR USER ID
            author: '61cc8cf56fbd68315f2276dc',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            geometry: {
                type: "Point", 
                coordinates: [-73.989308, 40.741895]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dj6vve2am/image/upload/v1641305949/yelp-camp/bxqq4tsxjo2we8vx5goa.jpg',
                    filename: 'yelp-camp/bxqq4tsxjo2we8vx5goa'
                    },
                    {
                    url: 'https://res.cloudinary.com/dj6vve2am/image/upload/v1641305949/yelp-camp/ae5tt6irqhkdcxqfm9rh.jpg',
                    filename: 'yelp-camp/ae5tt6irqhkdcxqfm9rh'
                    }
            ],
            // image: 'https://source.unsplash.com/collection/483251',
            description: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Cum culpa ullam, unde, officia, ipsa animi accusantium non sed explicabo earum natus placeat. Fuga iusto saepe cum repudiandae assumenda dolorem est?',
            price: price
        })
        await camp.save();    
    }
}

// seedDB returns a promise because it is an async function
seedDB().then(() => {
    mongoose.connection.close();
});
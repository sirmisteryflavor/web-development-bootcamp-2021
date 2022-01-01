const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const Joi = require('joi');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

const userRoutes = require('./routes/users');
const campgroundsRoutes = require('./routes/campgrounds');
const reviewsRoutes = require('./routes/reviews');

mongoose.connect('mongodb://localhost:27017/yelp-camp' )

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine('ejs', ejsMate);
// Tells it to use the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

// Tells it to use the data from POST request
app.use(express.urlencoded({ extended: true }))
// Override CRUD methods
app.use(methodOverride('_method'));

// order matters here.
const sessionConfig = {
    secret: 'thisshouldbeabettersecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        // Look at docs for explanation on this. Security related.
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

// This has to be before passport.session()
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

// Gets user into the session
passport.serializeUser(User.serializeUser());
// Removes user from the session
passport.deserializeUser(User.deserializeUser());

app.use(express.static(path.join(__dirname, 'public')))

// Flash middleware so that every single request will have access.
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    // if next() is not called, then nothing will run after this.
    next();
})

app.use('/', userRoutes);
app.use('/campgrounds', campgroundsRoutes);
app.use('/campgrounds/:id/reviews', reviewsRoutes);

app.get('/', (req, res) => {
    res.render('home')
})

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    // Give a default status code.
    const {statusCode = 500} = err;
    if (!err.message) {
        err.message = "Oh no. Something went wrong!"
    }
    res.status(statusCode).render('error', { err });   
})

// app.get('/makeCampground', async (req, res) => {
//     const camp = new Campground({
//         title: "Pittsburgh",
//         price: "29.00",
//         description: "Wilderness local experience.",
//         location: "27, 25"
//     });
//     await camp.save()
//     res.send(camp)
// })

app.listen(3000, () => {
    console.log('Serving on port 3000')
})
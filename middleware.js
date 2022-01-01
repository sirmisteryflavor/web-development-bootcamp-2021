// isAuthenticated comes from passport.
module.exports.isLoggedIn = (req, res, next) => {
    // session stores the serialized version of user
    // passport will deserialize the user and add info to req.user
    // console.log("REQ.USER", req.user);
    if (!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in');
        return res.redirect('/login')
    }
    next();
}

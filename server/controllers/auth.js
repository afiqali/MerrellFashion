// get gravatar icon from email
var gravatar = require('gravatar');
var passport = require('passport');

// Signin GET
exports.signin = function(req, res) {
    // List all Users and sort by Date
    res.render('login', { title: 'Login Page', message: req.flash('loginMessage') });
};

// Signup GET
exports.signup = function(req, res) {
    // List all Users and sort by Date
    res.render('signup', { title: 'Signup Page', message: req.flash('signupMessage') });
};


// Logout function
exports.logout = function () {
    req.logout();
    res.redirect('/');
};

// Ensure user is logged in before proceeding. Check if user is logged in: Yes - continue, No - redirect to Login page
exports.isLoggedIn = function(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/login');
};

// For login/signup. Check if user is logged in: Yes - redirect to Profile page, No - continue
exports.notLoggedIn = function(req, res, next) {
    if (req.isAuthenticated())
        res.redirect('/profile');
    return next();
};

// Render Profile page & get gravatar icon
exports.profile = function(req, res) {
    // List all Users and sort by Date
    res.render('profile', { title: 'Profile Page', user : req.user, avatar: gravatar.url(req.user.email ,  {s: '100', r: 'x', d: 'retro'}, true) });
};


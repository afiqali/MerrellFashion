// Import modules
var gravatar = require('gravatar');
var passport = require('passport');

// Render Login page
exports.signin = function(req, res) {
    // List all Users and sort by Date
    res.render('login', { title: 'Login Page', message: req.flash('loginMessage') });
};

// Render Signup page
exports.signup = function(req, res) {
    // List all Users and sort by Date
    res.render('signup', { title: 'Signup Page', message: req.flash('signupMessage') });

};


// Logout function
exports.logout = function () {
    req.logout();
    res.redirect('/');
};

// Check if user is logged in: Yes - continue, No - redirect to Login page
exports.isLoggedIn = function(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/login');
};

// Render Profile page & get gravatar icon
exports.profile = function(req, res) {
    // List all Users and sort by Date
    res.render('profile', { title: 'Profile Page', user : req.user, avatar: gravatar.url(req.user.email ,  {s: '100', r: 'x', d: 'retro'}, true) });
};



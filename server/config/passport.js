// Import passport-local module
var LocalStrategy = require('passport-local').Strategy;
// Import User model
var User = require('../models/users');

// Setup Passport
module.exports = function (passport) {
    // Serialize the user in a session by their user.id (key)
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    // Deserialize the user (get matched data from User model using key, user.id)
    passport.deserializeUser(function (id, done) {
        User.findById(id).then(function (user) {      
            if (user) {
                done(null, user.get());                
            } else {
                done(user.errors, null);                
            }
        });
    });

    // Login local strategy (passport-local module)
    passport.use('local-login', new LocalStrategy({
        // Change default username and password
        usernameField: 'email',            // tell Passport to set its usernameField to form input id="email"
        passwordField: 'password',         // tell Passport to set its passwordField to form input id="password"
        passReqToCallback: true            // Pass the HTML request to the callback - next()
    },
        function (req, email, password, done) {         // Clearer definition: function (req, usernameField, passwordField, done)
            // Format to lower-case
            email = email.toLowerCase();

            var isValidPassword = function (userpass, password) {       // Clearer definition: function (db_password, passwordField)
                return userpass === password;
            }

            // Asynchronous process
            process.nextTick(function () {
                // Check if user exists in User db, using email (usernameField)
                User.findOne({ where: { email: email } }).then((user) => {
                    if (!user)
                        return done(null, false, req.flash('loginMessage', 'No such user found.'));
                    // Check if password exists in User db, using password (passwordField)
                    if (!isValidPassword(user.password, password))
                        return done(null, false, req.flash('loginMessage', 'Wrong password!'));
                    // Everything ok, get matched user
                    else {
                        return done(null, user.get());
                    }
                }).catch((err) => {
                    console.log("Error:", err);
                    return done(err, false, req.flash('loginMessage', 'Error!'))
                });
            });
        }));

    // Signup local strategy (passport-local module)
    passport.use('local-signup', new LocalStrategy({
        // Change default username and password, to email and password
        usernameField: 'email',         // tell Passport to set its usernameField to form input id="email"
        passwordField: 'password',      // tell Passport to set its passwordField to form input id="password"
        passReqToCallback: true         // Pass the HTML request to the callback - next()
    },
        function (req, email, password, done) {
            // Format to lower-case
            email = email.toLowerCase();

            // Asynchronous process
            process.nextTick(function () {
                // If the user is not already logged in:
                if (!req.user) {
                    // Check if email is already taken by another user in db
                    User.findOne({ where: { email: email } }).then((user) => {
                        if (user) {
                            return done(null, false, req.flash('signupMessage', 'Woah! the email is already taken.'));
                        } else {
                            // Create the user
                            var userData = {
                                name: req.body.name,
                                email: email,
                                password: password,
                                gender: req.body.gender,
                                dob: req.body.dob,
                                contactNumber: req.body.contactNumber,
                                address: req.body.address
                            }

                            // Save data
                            User.create(userData).then((newUser, created) => {      // If user is created, true is returned (newUser), else false (!newUser). User may not be created due to incompatible info.
                                if (!newUser) {                 
                                    return done(null, false);
                                }
                                if (newUser) {
                                    return done(null, newUser);
                                }
                            })
                        }
                    }).catch((err) => {
                        console.log("Error:", err);
                        return done(err, false, req.flash('signupMessage', 'Error!'))
                    });
                } else {
                    return done(null, req.user);
                }
            });
        }
    ));
};

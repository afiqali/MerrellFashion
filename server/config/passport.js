// load passport module
var LocalStrategy = require('passport-local').Strategy;
// load up the user model
var User = require('../models/users');

module.exports = function (passport) {
    // passport init setup
    // serialize the user for the session
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });
    // deserialize the user
    passport.deserializeUser(function (id, done) {
        User.findById(id).then(function (user) {        // promise syntax
            if (user) {
                done(null, user.get());                 // 1st param: err, 2nd param:
            } else {
                done(user.errors, null);                // 1st param: err, 2nd param:
            }
        });
    });
    // using local strategy
    passport.use('local-login', new LocalStrategy({
        // change default username and password, to email and password
        usernameField: 'email',            // tells passport set its usernameField to form input name/id="email"
        passwordField: 'password',         // tells passport set its passwordField to form input name/id="password"
        passReqToCallback: true            // pass the HTML request to the callback - next function
    },
        function (req, email, password, done) {     // function (req, usernameField, passwordField, done)

            // format to lower-case
            email = email.toLowerCase();

            var isValidPassword = function (userpass, password) {       // function (db_password, passwordField)
                return userpass === password;
            }
            // process asynchronous
            process.nextTick(function () {
            
                User.findOne({ where: { email: email } }).then((user) => {
                    // check errors and bring the mess  ages
                    if (!user)
                        return done(null, false, req.flash('loginMessage', 'No such user found.'));
                    if (!isValidPassword(user.password, password))
                        return done(null, false, req.flash('loginMessage', 'Wrong password!'));
                    // everything ok, get user
                    else {
                        return done(null, user.get());
                    }
                }).catch((err) => {
                    console.log("Error:", err);
                    return done(err, false, req.flash('loginMessage', 'Error!'))
                });
            });
        }));

    // Signup local strategy
    passport.use('local-signup', new LocalStrategy({
        // change default username and password, to email and password
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
        function (req, email, password, done) {

            // format to lower-case
            email = email.toLowerCase();

            // asynchronous
            process.nextTick(function () {
                // if the user is not already logged in:
                if (!req.user) {
                    // check if email is already taken by another user in db
                    User.findOne({ where: { email: email } }).then((user) => {
                        if (user) {
                            return done(null, false, req.flash('signupMessage', 'Wohh! the email is already taken.'));
                        } else {
                            // create the user
                            var userData = {
                                name: req.body.name,
                                email: email,
                                password: password,
                                gender: req.body.gender,
                                dob: req.body.dob,
                                contactNumber: req.body.contactNumber,
                                address: req.body.address
                            }

                            // save data
                            User.create(userData).then((newUser, created) => {  // If user is created, true is returned (newUser), else false (!newUser). User may not be created due to incompatible info.
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
        }));
};

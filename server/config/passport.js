// load passport module
var LocalStrategy = require('passport-local').Strategy;
// load up the user model
var User = require('../models/users');
var fs = require('fs');
var mime = require('mime');

var IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

// Mailgun (Comment this out if pushing to open-source)
var api_key = '0d6fa9ff10930d6dc61bb31250b91422-7efe8d73-b681ae43';
var DOMAIN = 'sandbox0b40f66fa4094d1da12f65c9246b5fdd.mailgun.org';

var mailgun = require("mailgun-js");
var mailgun = require('mailgun-js')({ apiKey: api_key, domain: DOMAIN });

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
        usernameField: 'email',            // tells passport set its usernameField to form input id="email"
        passwordField: 'password',         // tells passport set its passwordField to form input id="password"
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
                    // check errors and bring the messages
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
                            // Upload image file 
                            var src;
                            var dest;
                            var targetPath;
                            var targetName;
                            var tempPath = req.file.path;

                            // get the mime type of the file
                            var type = mime.lookup(req.file.mimetype);

                            // get file extension
                            var extension = req.file.path.split(/[. ]+/).pop();

                            // check support file types
                            if (IMAGE_TYPES.indexOf(type) == -1) {
                                return res.status(415).send('Supported image formats: jpeg, jpg, jpe, png. ');
                            }

                            // Set new path to images
                            targetPath = './public/images/' + req.file.originalname;

                            // using read stream API to read file
                            src = fs.createReadStream(tempPath);

                            // using a write stream API to write file
                            dest = fs.createWriteStream(targetPath);
                            src.pipe(dest);

                            // Show error
                            src.on('error', function (err) {
                                if (err) {
                                    return res.status(500).send({
                                        message: error
                                    });
                                }
                            });

                            // Save file process
                            src.on('end', function () {
                                // create a new instance of the Images model with request body
                                var img = {
                                    imageName: req.file.originalname,
                                }

                                // remove from temp folder
                                fs.unlink(tempPath, function (err) {
                                    if (err) {
                                        return res.status(500).send('Something bad happened here')
                                    }
                                })

                                var userData = {
                                    name: req.body.name,
                                    email: email,
                                    password: password,
                                    gender: req.body.gender,
                                    dob: req.body.dob,
                                    contactNumber: req.body.contactNumber,
                                    address: req.body.address,
                                    img: img.imageName
                                }

                                // Push new user to db
                                User.create(userData).then((newUser, created) => {  // If user is created, true is returned (newUser), else false (!newUser). User may not be created due to incompatible info.
                                    if (!newUser) {
                                        return done(null, false);
                                    }
                                    if (newUser) {
                                        // Send verification email
                                        var data = {
                                            from: 'Merrell Fashion - Payment Success! <merrellfashionbizz@gmail.com>',
                                            to: 'jnjw55@gmail.com',
                                            subject: 'Merrell Fashion account verification',
                                            html: '<h1>Please click the link to verify your new account: </h1>' + "<a href='http://localhost:3000/'>Link</a>"
                                        };

                                        mailgun.messages().send(data, function (error, body) {
                                            console.log(body);
                                        });

                                        return done(null, newUser);
                                    }
                                }).catch((err) => {
                                    console.log("Error:", err);
                                    return done(err, false, req.flash('signupMessage', 'Error!'))
                                });
                            })
                        }
                    })
                } else {
                    return done(null, req.user);
                }
            });
        }));
};

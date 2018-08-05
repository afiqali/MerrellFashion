// Import User model
var User = require('../models/users');
// Import database.js and pass it to sequelize
var myDatabase = require('./database');
var sequelize = myDatabase.sequelize;
// Import modules
var fs = require('fs');
var mime = require('mime');

var IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

exports.displayAccount = function (req, res) {
    sequelize.query(`select * from Users where id=${req.user.id}`, { model: User })
        .then((user) => {
            res.render('account', {
                title: 'Account Page',
                users: user,
                message: req.flash("Profile change")
            })
        })
        .catch((err) => {
            return res.status(400).send({
                message: err
            });
        });
};

exports.editAccount = function (req, res) {

    var editUserData = {
        name: req.body.name,
        email: req.body.email,
        gender: req.body.gender,
        dob: req.body.dob,
        contactNumber: req.body.contactNumber,
        address: req.body.address
    }

    // Update matched User db record one-by-one
    User.update({ name: editUserData.name }, { where: { id: req.user.id } })
        .then(
            User.update({ email: editUserData.email }, { where: { id: req.user.id } })
        )
        .then(
            User.update({ gender: editUserData.gender }, { where: { id: req.user.id } })
        )
        .then(
            User.update({ dob: editUserData.dob }, { where: { id: req.user.id } })
        )
        .then(
            User.update({ contactNumber: editUserData.contactNumber }, { where: { id: req.user.id } })
        )
        .then(
            User.update({ address: editUserData.address }, { where: { id: req.user.id } })
        )
        .then(
            req.flash("Profile change", "Profile changed successfully"),
            res.redirect("/account")
        )
        .catch((err) => {
            req.flash("Profile change", "Profile change failed")
            return res.status(400).send({
                message: err
            }).redirect("/account");
        });
};

exports.getPassword = function (req, res) {
    res.render('changePassword', {
        title: "Change password",
        message: req.flash("loginMessage")            // Can't pass in req.flash() 
    })
}

exports.editPassword = function (req, res) {
    sequelize.query(`select password from Users where id=${req.user.id}`, { model: User })
        .then((pwd) => {
            var editUserData = {
                op: req.body.op,
                np: req.body.np,
                cp: req.body.cp
            }

            if (editUserData.op == pwd[0]['dataValues']['password']) {
                if (editUserData.np == editUserData.cp) {
                    User.update({ password: editUserData.np }, { where: { id: req.user.id } })
                    var msg = "Password changed successfully"
                }
                else {
                    msg = "Password change failed - New password does not match Confirm password"
                }
            }
            else if (editUserData.op != pwd[0]['dataValues']['password']) {
               msg = "Password change failed - Old password is incorrect"
            }

            res.render('changepassword', {
                title: "Change password",
                message: msg
            })
        })
}

var User = require('../models/users');
var orderStatus = require('../models/orderStatus');
var myDatabase = require('./database');
var sequelize = myDatabase.sequelize;
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
        // user_id: req.user.id,
        // payment_id: req.body.payment_id,
        // totalAmount: req.body.totalAmount,
        // status: req.body.status,
        // orderMethod: req.body.orderMethod
        // item_id: req.item.item_id
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

exports.displayOrder = function (req, res) {
    sequelize.query(`select * from orderStatuses where user_id=${req.user.id}`, { model: orderStatus })
    .then((status) => {
        console.log(status)
        console.log(status1)
        console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAa")
        var status1 = status[0]['dataValues']['status']
        var text;
        var circle;

        switch (status1) {
            case 1:
                circle = status1;
                break;
            case 2:
                circle = status1;
                break;
            default:
                circle ="";
        }
        
        res.render('trackOrder', {
            title: "Track order",
            message: req.flash("loginMessage"),
            circle: circle
        })
    })
}

exports.displayTrxHistory = function (req, res) {
    res.render('trxHistory', {
        title: "Transaction history",
        message: req.flash("loginMessage")
    })
}
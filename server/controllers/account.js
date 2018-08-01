var User = require('../models/users');
var myDatabase = require('./database');
var sequelize = myDatabase.sequelize;
var fs = require('fs');
var mime = require('mime');

var IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

exports.displayAccount = function (req, res) {
    sequelize.query(`select * from Users where id=${req.user.id}`, {model: User})
    .then((user) => {
        res.render('account', {
            title: 'Account Page',
            users: user
        })
    })
    .catch((err)=>{
        return res.status(400).send({
            message: err
        });
    });
};

exports.changePassword = function (req, res) {
    var editUserData = {
        op: req.body.op,
        np: req.body.np,
        cp: req.body.cp
    }

    sequelize.query(`select password from Users where id=${req.user.id}`, {model: User})
    .then((password) => {
    if (op == password) {
        console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAa")
    }
})
}

exports.editAccount = function (req, res) {
    var editUserData = {
        // payer_id = details.payer_id,
        name : req.body.name,
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

    User.update({ name: editUserData.name }, { where: {id: req.user.id} })
    .then(
        User.update({ email: editUserData.email }, { where: {id: req.user.id} })
    )
    .then(
        User.update({ gender: editUserData.gender }, { where: {id: req.user.id} })
    )
    .then(
        User.update({ dob: editUserData.dob }, { where: {id: req.user.id} })
    )
    .then(
        User.update({ contactNumber: editUserData.contactNumber }, { where: {id: req.user.id} })
    )
    .then(
        User.update({ address: editUserData.address }, { where: {id: req.user.id} })
    )
    .then(
        res.redirect('/')
    )
    .catch((err) => {
        return res.status(400).send({
            message: err
        });
    });
};



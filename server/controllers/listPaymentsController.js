// get Order model
var Order = require("../models/paymentModel");
var itemModel = require("../models/productlist");
var myDatabase = require('./database');
var sequelize = myDatabase.sequelize; 


// List Orders & render page
exports.getItem = function(req,res) {
    var user_id = req.user.id
    sequelize.query('SELECT * FROM productlists p WHERE p.user_id = ' + user_id,{model:itemModel}).then((receipt) => {
        res.render('listPayments', {
            title: 'Your previous payments.',
            user: req.user,
            receipt: receipt,
            hostPath: req.protocol + "://" + req.get("host")
        })
    }).catch((err) => {
        return res.status(400).send({
            message:err
        });
    });



};
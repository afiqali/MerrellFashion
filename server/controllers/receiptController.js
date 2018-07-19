// get Order model
var Order = require("../models/paymentModel");
var itemModel = require("../models/productlist");
var myDatabase = require('./database');
var sequelize = myDatabase.sequelize; 


// List Orders & render page
exports.getItem = function(req,res) {
    var itemID = req.params.id;
    itemModel.findById(itemID).then(function (item) {
        res.render('receipt', {
            title: 'Your receipt',
            user: req.user,
            item: item,
            hostPath: req.protocol + "://" + req.get("host")
        });
    }).catch((err) => {
        return res.status(400).send({
            message:err
        });
    });

};

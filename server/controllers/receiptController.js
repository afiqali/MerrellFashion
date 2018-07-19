// get Order model
var Order = require("../models/paymentModel");
var itemModel = require("../models/productlist");
var myDatabase = require('./database');
var sequelize = myDatabase.sequelize; 


// List Orders & render page
exports.getItem = function(req,res) {
    var itemID = req.params.id;
    var payment_id = req.params.payment_id;
    // sequelize.query('SELECT * FROM productlists',{model:itemModel}).then((receipt) => {
    //     res.render('receipt', {
    //         title: 'Your receipt',
    //         user: req.user,
    //         receipt: receipt,
    //         hostPath: req.protocol + "://" + req.get("host")
    //     })
    // }).catch((err) => {
    //     return res.status(400).send({
    //         message:err
    //     });
    // });

    itemModel.findById(itemID).then(function (item) {
        Order.findById(payment_id).then(function (order) {
            res.render('receipt', {
                title: 'Your receipt',
                user: req.user,
                item: item,
                order: order,
                hostPath: req.protocol + "://" + req.get("host")
            });
        });
    }).catch((err) => {
        return res.status(400).send({
            message:err
        });
    });

};

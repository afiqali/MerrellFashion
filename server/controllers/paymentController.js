// get Order model
var Order = require("../models/paymentModel");
var itemModel = require("../models/productlist");
var myDatabase = require('./database');
var sequelize = myDatabase.sequelize; 

var itemID;
exports.getItem = function(req,res) {
    itemID = req.params.id;
    itemModel.findById(itemID).then(function (item) {
        res.render('payment', {
            title: 'Payment Page',
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

// Create Order
exports.create = function (req, res) {
    console.log("creating payment")

    // var orderData = {
    //     user_id: req.user.id,
    //     totalAmount: req.body.totalAmount,
    //     // credit_card_id: req.body.credit_card_id,
    //     status: req.body.status,
    //     orderMethod: req.body.orderMethod,
    //     // item_id: req.item.item_id
    // }

    var orderData = {
        // payer_id = details.payer_id,
        payer_id : req.body.payer_id,
        user_id: req.user.id,
        Itemid: itemID,
        payment_id: req.body.payment_id,
        totalAmount: req.body.totalAmount,
        status: req.body.status,
        orderMethod: req.body.orderMethod
        // item_id: req.item.item_id
    }

    Order.create(orderData).then((newOrder, created) => {
        if (!newOrder) {
            return res.send(400, {
                message: "error"
            });
        }
        // var url;
        url = '/receipt/' + itemID.toString();
        res.redirect(url);
    })
}


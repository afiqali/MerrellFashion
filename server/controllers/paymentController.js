// get Order model
var Order = require("../models/paymentModel");
var stripe = require("stripe")("sk_test_RS2ZwJbELQPZS0aUxODCdZC9");
var itemModel = require("../models/productlist");
var myDatabase = require('./database');
var sequelize = myDatabase.sequelize; 

var itemID;
var payment_id;



// Get specific record - GET
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

// Create Order - POST
exports.create = function (req, res) {
    console.log("creating payment");
    payment_id = req.body.payment_id;


    var orderData = {
        payment_id: req.body.payment_id,
        payer_id : req.body.payer_id,
        user_id: req.user.id,
        totalAmount: req.body.totalAmount,
        status: req.body.status,
        orderMethod: req.body.orderMethod
    }

    Order.create(orderData).then((newOrder, created) => {
        if (!newOrder) {
            return res.send(400, {
                message: "error"
            });
        }
        // var url;
        url = '/receipt/' + itemID.toString() + '/' + payment_id;
        res.redirect(url);
    })
}

// Do Stripe things - POST
exports.doStripe = function (req,res) {
        
        const token = req.body.stripeToken; // Using Express
        var amount1 = req.body.price1;
        console.log(amount1);
        amount1 = parseFloat(req.body.price1);
        console.log("Post is working");
        console.log(amount1);
        var charge = stripe.charges.create({
            amount: amount1,
            currency: 'sgd',
            description: 'Example charge',
            source: token,
        }).then(function(charge){
            console.log(JSON.stringify(charge))
            console.log("did it even create")
            var stripeData = {
                payment_id: charge.id,
                payer_id : charge.source.id,
                user_id: req.user.id,
                totalAmount: req.body.totalAmount,
                status: req.body.status,
                orderMethod: charge.source.brand
            }
        
            Order.create(stripeData).then((newOrder, created) => {
                if (!newOrder) {
                    return res.send(400, {
                        message: "error"
                    });
                }
                // var url;
                url = '/receipt/' + itemID.toString() + '/' + charge.id;
                res.redirect(url);
            })
        }).catch((err) => {
            return res.status(400).send({
            message:err
        });
        });
}


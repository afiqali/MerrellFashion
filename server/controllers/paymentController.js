// get Order model
var Order = require("../models/paymentModel");
var stripe = require("stripe")("sk_test_RS2ZwJbELQPZS0aUxODCdZC9");

// var mailgun = require("mailgun-js");

// var mailgun = require('mailgun-js')({apiKey: api_key, domain: DOMAIN});

var accountSid = 'AC6ced1d481c8e1d8ec33c4f0da613e3e8'; // Your Account SID from www.twilio.com/console
var authToken = '5554f393e7cf77b1496cb9f2de0d61e2';   // Your Auth Token from www.twilio.com/console

var twilio = require('twilio');
var client = new twilio(accountSid, authToken);

var itemModel = require("../models/productlist");
var myDatabase = require('./database');
var sequelize = myDatabase.sequelize; 

var itemID;
var payment_id;


// Get specific record - GET
exports.getItem = function(req,res) {

    
    itemID = req.params.id;
    itemModel.findById(itemID).then(function (item) {
        if (item.status == 'c' || item.status == 'd') {
            return res.redirect('/profile');
        }
        else if (req.user.id == item.user_id) {
            return res.redirect('/profile');
        }
        else {        
            res.render('payment', {
            title: 'Payment Page',
            user: req.user,
            item: item,
            hostPath: req.protocol + "://" + req.get("host")
        });
        }

    }).catch((err) => {
        return res.status(400).send({
                        message:err
        });
    });


};

// Create Order - POST
exports.create = function (req, res) {
    itemID = req.params.id;
    itemModel.findById(itemID).then(function (item) {
        if (item.status == 'c' || item.status == 'd') {
            return res.redirect('/profile');
        }
    }).catch((err) => {
        return res.status(400).send({
                        message:err
        });
    });

    console.log("creating payment");
    payment_id = req.body.payment_id;
    console.log((req.body.item_id).toString())

    var orderData = {
        payment_id: req.body.payment_id,
        Itemid: req.params.id,
        payer_id : req.body.payer_id,
        user_id: req.user.id,
        totalAmount: parseFloat(req.body.totalAmount),
        status: req.body.status,
        orderMethod: req.body.orderMethod,
        collectionDate: req.body.dob2
    }

    Order.create(orderData).then((newOrder, created) => {
        if (!newOrder) {
            return res.send(400, {
                message: "error"
            });
        }
        var updateData = {
            status: 'c'
        }
    
        itemModel.update(updateData, { where: {Itemid: itemID} }).then((updatedRecord) => {
            if (!updatedRecord || updatedRecord ==0) {
                return res.send(400, {
                    message: "error"
                });
            }

        })

        client.messages.create({
            body: 'Hello from Node',
            to: '+6592211065',  // Text this number
            from: '+16193042412' // From a valid Twilio number
        })
        .then((message) => console.log(message.sid));

        var data = {
            from: 'Excited User <merrellfashionbizz@gmail.com>',
            to: 'tqinyong@yahoo.com.sg',
            subject: 'Hello',
            text: 'Testing some Mailgun awesomness!'
          };
          
          mailgun.messages().send(data, function (error, body) {
            console.log(body);
          });

        // var url;
        url = '/receipt/' + itemID.toString() + '/' + payment_id;
        res.redirect(url);
    })


}

// Do Stripe things - POST
exports.doStripe = function (req,res) {
        console.log(req.body.dob1)
        itemID = req.params.id;
        itemModel.findById(itemID).then(function (item) {
            if (item.status == 'c' || item.status == 'd') {
                return res.redirect('/profile');
            }
            

        }).catch((err) => {
            return res.status(400).send({
                            message:err
            });
        });
        
        const token = req.body.stripeToken; // Using Express
        var amount1 = req.body.price1;
        amount1 = parseFloat(req.body.price1)*100;
        var charge = stripe.charges.create({
            amount: amount1,
            currency: 'sgd',
            description: 'Example charge',
            source: token,
        }).then(function(charge){
            console.log(JSON.stringify(charge))
            console.log(req.body.item_id1)
            console.log("did it even create")
            var stripeData = {
                payment_id: charge.id,
                Itemid: req.params.id,
                payer_id : charge.source.id,
                user_id: req.user.id,
                totalAmount: req.body.price1,
                status: req.body.status1,
                orderMethod: charge.source.brand,
                collectionDate: req.body.dob1
            }
        
            Order.create(stripeData).then((newOrder, created) => {
                if (!newOrder) {
                    return res.send(400, {
                        message: "error"
                    });
                }
                // var url;
                var updateData = {
                    status: 'c'
                }
            
                itemModel.update(updateData, { where: {Itemid: itemID} }).then((updatedRecord) => {
                    if (!updatedRecord || updatedRecord ==0) {
                        return res.send(400, {
                            message: "error"
                        });
                    }
        
                })

                client.messages.create({
                    body: 'Hello from Node',
                    to: '+6592211065',  // Text this number
                    from: '+16193042412' // From a valid Twilio number
                })
                .then((message) => console.log(message.sid));

                var data = {
                    from: 'Excited User <smerrellfashionbizz@gmail.com>',
                    to: 'tqinyong@yahoo.com.sg',
                    subject: 'Hello',
                    text: 'Testing some Mailgun awesomness!'
                  };
                  
                  mailgun.messages().send(data, function (error, body) {
                    console.log(body);
                  });
        
                url = '/receipt/' + itemID.toString() + '/' + charge.id;
                res.redirect(url);
            })
        }).catch((err) => {
            return res.status(400).send({
            message:err
        });
        });


}


// get Order model
var Order = require("../models/paymentModel");
var offersModel = require("../models/offersModel");

var stripe = require("stripe")("sk_test_RS2ZwJbELQPZS0aUxODCdZC9");

// This mails the receipt to the user email (exposed api credentials - DONT PUSH TO GITHUB)
// I forgot to say this lol
var mailgun = require("mailgun-js");
var api_key = '0d6fa9ff10930d6dc61bb31250b91422-7efe8d73-b681ae43';
var DOMAIN = 'sandbox0b40f66fa4094d1da12f65c9246b5fdd.mailgun.org';
var mailgun = require('mailgun-js')({apiKey: api_key, domain: DOMAIN});

// Sends receipt to user phone number (TRY NOT TO PUSH TO GITHUB)
var accountSid = 'AC6ced1d481c8e1d8ec33c4f0da613e3e8'; 
var authToken = '5554f393e7cf77b1496cb9f2de0d61e2';   

var twilio = require('twilio');
var client = new twilio(accountSid, authToken);

var itemModel = require("../models/productlist");
var myDatabase = require('./database');
var sequelize = myDatabase.sequelize; 

var itemID;
var payment_id;


// Get specific record - GET
exports.getItem = function(req,res) {
    
    transactionID = req.params.transactionID;
    itemID = req.params.id;
    itemModel.findById(itemID).then(function (item) {
        if (item.status == 'c' || item.status == 'd') {
            return res.redirect('/profile');
        }
        else if (req.user.id == item.user_id) {
            return res.redirect('/profile');
        }
        else {        
            offersModel.findById(transactionID).then(function(offer) {
                if(offer.offerStatus == "active" && offer.offerType == "accepted") {
                    res.render('payment', {
                        title: 'Payment Page',
                        user: req.user,
                        item: item,
                        offer: offer,
                        hostPath: req.protocol + "://" + req.get("host")
                    });
                } else { return res.redirect('/profile')}
            })
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
    transactionID = req.params.transactionID;
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
            body: 'Payment ID: ' + req.body.payment_id +
                  ' Payer ID: ' + req.body.payer_id +
                  ' Amount Paid: ' + req.body.totalAmount +
                  ' Status: ' + req.body.status +
                  ' Order Method: ' + req.body.orderMethod +
                  ' Collection Date: ' + req.body.dob2 ,
            to: '+6592211065',  // Text this number
            from: '+16193042412' // From a valid Twilio number
        })
        .then((message) => console.log(message.sid));

        var data = {
            from: 'Merrell Fashion - Payment Success! <merrellfashionbizz@gmail.com>',
            to: 'tqinyong@yahoo.com.sg',
            subject: 'Your Receipt',
            html: '<h3> Payment ID: </h3>' + req.body.payment_id +
                  '<h4> Payer ID: </h4>' + req.body.payer_id +
                  '<h4> Amount Paid: </h4>' + req.body.totalAmount +
                  '<h4> Status: </h4>' + req.body.status +
                  '<h4> Order Method: </h4>' + req.body.orderMethod +
                  '<h4> Collection Date: </h4>' + req.body.dob2 
          };
          
          mailgun.messages().send(data, function (error, body) {
            console.log(body);
          });

        // var url;
        url = '/receipt/' + itemID.toString() + '/' + payment_id + '/' + transactionID;
        res.redirect(url);
    })


}

// Do Stripe things - POST
exports.doStripe = function (req,res) {
        console.log(req.body.dob1);
        itemID = req.params.id;
        transactionID = req.params.transactionID;
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
        console.log(amount1);
        amount1 = (Math.round(parseFloat(req.body.price1)*100,0)).toFixed(0);
        console.log(amount1);
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
                    body: ' Payment ID: ' + charge.id +
                          ' Payer ID: ' + charge.source.id +
                          ' Amount Paid: ' + req.body.price1 +
                          ' Status: ' + req.body.status1 +
                          ' Order Method: ' + charge.source.brand +
                          ' Collection Date: ' + req.body.dob1 ,
                    to: '+6592211065',  // Text this number
                    from: '+16193042412' // From a valid Twilio number
                })
                .then((message) => console.log(message.sid));

                var data = {
                    from: 'Merrell Fashion - Payment Success! <merrellfashionbizz@gmail.com>',
                    to: 'tqinyong@yahoo.com.sg',
                    subject: 'Your Receipt',
                    html: '<h3> Payment ID: </h3>' + charge.id +
                          '<h4> Payer ID: </h4>' + charge.source.id +
                          '<h4> Amount Paid: </h4>' + req.body.price1 +
                          '<h4> Status: </h4>' + req.body.status1 +
                          '<h4> Order Method: </h4>' + charge.source.brand +
                          '<h4> Collection Date: </h4>' + req.body.dob1
                  };
                  
                  mailgun.messages().send(data, function (error, body) {
                    console.log(body);
                  });
        
                url = '/receipt/' + itemID.toString() + '/' + charge.id + '/' + transactionID;
                res.redirect(url);
            })
        }).catch((err) => {
            return res.status(400).send({
            message:err
        });
        });


}


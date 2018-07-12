// get Order model
var Order = require("../models/paymentModel");
var myDatabase = require('./database');
var sequelize = myDatabase.sequelize; 


// List Orders & render page
exports.list = function(req, res) {
    // List all orders and sort by Date
    // Select * from order o left join orderitems oi on o.orderid = oi.orderid
    // select o.order_id, o.totalAmount, o.credit_card_id, o.orderDate, o.status, o.orderMethod, u.id from Order o join Users u on o.user_id = u.id
    sequelize.query("select * from Orders"
    , {model:Order}).then((orders) => {

        res.render('payment', {
            title: 'Payment Page',
            user: req.user,
            orders: orders,
        })
    }).catch((err)=>{
        return res.status(400).send({
            message: err
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
        payment_id: req.body.payment_id,
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
        // url = '/receipt/' + req.body.payer_id;
        res.redirect('/receipt');
    })
}


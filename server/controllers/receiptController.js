// get Order model
var Order = require("../models/paymentModel");
var myDatabase = require('./database');
var sequelize = myDatabase.sequelize; 


// List Orders & render page
exports.show = function(req, res) {
    // List all orders and sort by Date
    // Select * from order o left join orderitems oi on o.orderid = oi.orderid
    // select o.order_id, o.totalAmount, o.credit_card_id, o.orderDate, o.status, o.orderMethod, u.id from Order o join Users u on o.user_id = u.id
    sequelize.query("select * from Orders o inner join Users u on o.user_id = u.id"
    , {model:Order}).then((orders) => {

        res.render('receipt', {
            title: 'Your Receipt',
            user: req.user,
            orders: orders,
        })
    }).catch((err)=>{
        return res.status(400).send({
            message: err
        });
    });
};

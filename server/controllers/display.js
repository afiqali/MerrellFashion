var Order = require('../models/paymentModel');
var User = require('../models/users');
var myDatabase = require('./database');
var sequelize = myDatabase.sequelize;

exports.displayOrder = function (req, res) {
    console.log(req.user.email);
    if (req.user.email == "admin@b.com") {
            // List all orders and sort by Date
            // Select * from order o left join orderitems oi on o.orderid = oi.orderid
            // select o.order_id, o.totalAmount, o.credit_card_id, o.orderDate, o.status, o.orderMethod, u.id from Order o join Users u on o.user_id = u.id
            sequelize.query("select o.order_id, o.totalAmount, o.credit_card_id, o.orderDate, o.status, o.orderMethod, u.id, u.name from Orders o join Users u on o.user_id = u.id"
            ).then((orders) => {                    // {model: Order} -> instance of model created 
        
                res.render('display', {
                    title: 'Display Page',
                    user: req.user,
                  orders: orders
                })
            }).catch((err)=>{
                return res.status(400).send({
                    message: err
                });
            });


        };
    }

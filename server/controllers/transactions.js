var transactionModel = require('../models/transactionsModel');
var myDatabase = require('./database');
var sequelizeInstance = myDatabase.sequelizeInstance;

// list out transaction record
exports.list = function(req,res) {
    transactionModel.find({
        attributes: ['id', 'user_id', 'item_id', 'status', 'date_created']
    }).then(function (transactions) {
        res.render('transactions', {
            title: "Transaction History",
            itemList: transactions,
            urlPath: req.protocol + "://" + req.get("host") + req.url
        });
    }).catch((err) => {
        return res.status(400).send({
            message: err
        });
    });
};

// update transaction record
// exports.update = function (req, res) {
//     var record_num = req.params.id;
//     var updateRecord = {
//         user_id: req.body.user_id,
//         item_id: req.body.item_id,
//         status: req.body.status,
//         date_created: req.body.date_created
//     }
//     transactionModel.update(updateRecord, { where: { id: record_num} }).then((updatedRecord) => {
//         if (!updatedRecord || updatedRecord == 0) {
//             return res.send(400 , {
//                 message: "error"
//             });
//         }
//         res.status(200).send({ message: "Updated Transaction Record:" + record_num});
//     })
// }
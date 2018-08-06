var offersModel = require('../models/offersModel');
var itemModel = require('../models/productlist');
var userModel = require('../models/users');
var myDatabase = require('./database');
var sequelize = myDatabase.sequelize;
var Sequelize = myDatabase.Sequelize;
const Op = sequelize.Op;

exports.makeOffer = function(req,res) {
    var itemRecord = req.params.id;
    var userRecord = req.user.id;
    offersModel.findAll({
        where: {
            buyerID: userRecord,
            offerStatus: "active",
            itemID: itemRecord,
            offerType: {
                [Op.or]:["offer","newOffer","rejected"]
            },
        }
    }).then(function(offers) {
        for(var i=0;i<offers.length;i++){

            var updateData = { offerStatus: "inactive" }

            offersModel.update(updateData, { where: {transactionID: offers[i].transactionID } }).then((softDeletedRecord) => {
            if (!softDeletedRecord) {
                return res.send(400, {
                        message: "error"
                    });
                }
            })
        }
    })
    itemModel.findById(itemRecord).then((item) => {
        userModel.findById(userRecord).then((buyerUser) => {
            userModel.findById(item.user_id).then((user) => {
                var offerData = {
                    itemID: item.Itemid,
                    itemName: item.ItemName,
                    offerAmount: req.body.offerAmount,
                    sellerID: item.user_id,
                    sellerName: user.name,
                    buyerID: userRecord,
                    buyerName: buyerUser.name,
                    offerType: "offer",
                    offerStatus: "active",
                }
                offersModel.create(offerData).then((newOffer) => {
                if (!newOffer) {
                    return res.send(400, {
                        message: "error"
                    });
                }
                url = '/offerBuyer';
                res.redirect(url);
                });
            })
        })
    })
}

exports.sellerView = function(req, res) {
    var userRecord = req.user.id;
    offersModel.findAll({
        where: {
            offerStatus: "active",
            sellerID: userRecord
        }
    }).then(function (offers) {
        res.render('offerSeller', {
            title: "Offers(Seller)",
            itemList: offers,
            urlPath: req.protocol + "://" + req.get("host") + req.url
        });
    }).catch((err) => {
        return res.status(400).send({
            message: err
        });
    });
}

exports.buyerView = function(req, res) {
    var userRecord = req.user.id;
    offersModel.findAll({
        where: {
            offerStatus: "active",
            buyerID: userRecord
        }
    }).then(function (offers) {
        res.render('offerBuyer', {
            title: "offers(Buyer)",
            itemList: offers,
            urlPath: req.protocol + "://" + req.get("host") + req.url
        });
    }).catch((err) => {
        return res.status(400).send ({
            message: err
        });
    });
}

exports.offerDetails = function(req,res) {
    var offerRecord = req.params.id
    
    offersModel.findById(offerRecord).then(function(offer) {
        itemModel.findById(offer.itemID).then(function(item) {
            if(offer.offerStatus == "active") {
                res.render('offerDetails', {
                    title: 'Offer Details',
                    itemList: item,
                    offerList: offer,
                    hostPath: req.protocol + "://" + req.get("host"),
                    urlPath: req.protocol + "://" + req.get("host") + req.url
                })
            } else {
                res.status(404).send('<h1 >Oops, You are not Supposed to be here.</h1>' +
             '<br/> <a href="'+ req.protocol + "://" + req.get("host") + '"> << Return to homepage</a>');
            }
        }).catch((err) => {
            return status(400).send({
                message: err
            });
        });
    }).catch((err) => {
        return status(400).send({
            message: err
        });
    });
}

exports.acceptOffer = function(req,res) {
    var offerRecord = req.params.id;
    
    offersModel.findById(offerRecord).then((offered) => {
        offersModel.findAll({
            where: {
                offerStatus: "active",
                itemID: offered.itemID
            }
        }).then(function(offers) {
            for(var i=0;i<offers.length;i++){

                var updateData = { offerStatus: "inactive" }

                offersModel.update(updateData, { where: {transactionID: offers[i].transactionID } }).then((softDeletedRecord) => {
                if (!softDeletedRecord) {
                    return res.send(400, {
                            message: "error"
                        });
                    }
                })
            }
        })
    })
        
    offersModel.findById(offerRecord).then((offered) => {
        itemModel.findById(offered.itemID).then((item) => {
            var offerData = {
                itemID: item.Itemid,
                itemName: item.ItemName,
                offerAmount: offered.offerAmount,
                sellerID: item.user_id,
                sellerName: offered.sellerName,
                buyerID: offered.buyerID,
                buyerName: offered.buyerName,
                offerType: "accepted",
                offerStatus: "active",
            }
            offersModel.create(offerData).then((newOffer) => {
                if (!newOffer) {
                    return res.send(400, {
                        message: "error"
                    });
                }
                url = '/offerSeller';
                res.redirect(url);
            }) 
        })
    })
}

exports.rejectOffer = function(req, res) {
    var offerRecord = req.params.id

    offersModel.findById(offerRecord).then((offered) => {
        itemModel.findById(offered.itemID).then((item) => {
            var offerData = {
                itemID: item.Itemid,
                itemName: item.ItemName,
                offerAmount: offered.offerAmount,
                sellerID: item.user_id,
                sellerName: offered.sellerName,
                buyerID: offered.buyerID,
                buyerName: offered.buyerName,
                offerType: "rejected",
                offerStatus: "active",
            }
            offersModel.create(offerData).then((newOffer) => {
                if (!newOffer) {
                    return res.send(400, {
                        message: "error"
                    });
                }
            })
        })
    })
    var updateData = {offerStatus: "inactive"}
    offersModel.update(updateData, {where: {transactionID:offerRecord} }).then((softDeletedRecord) =>{
        if(!softDeletedRecord) {
            return res.send(400, {
                message: "error"
            });
        }
        res.status(200).send({ message: "Offer rejected: " + offerRecord });
    })
}

exports.transactionAdmin = function(req,res) {
    offersModel.findAll({
        where: {
            offerStatus: {
                [Op.or] : ["active", "inactive"]
            }
        }
    }).then(function (transactions) {
        res.render('transactionAdmin', {
            title: "Transaction Log",
            offerList: transactions,
            urlPath: req.protocol + "://" + req.get("host") + req.url
        });
    }).catch((err) => {
        return res.status(400).send({
            message: err
        });
    });
};
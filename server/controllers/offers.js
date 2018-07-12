var offersModel = require("../models/offersModel");
var myDatabase = require("../controllers/database");
var Sequelize = myDatabase.Sequelize;

exports.displayButton = function(req, res) {
    res.render("offers")
}

exports.makeOffer = function( req, res) {
    console.log("making offer")

    var offerData = {
        offerAmount: req.body.offerAmount,
        userID: req.user.id,
    }

    offersModel.create(offerData).then((newOffer, created) => {
        if (!newOffer) {
            return res.send(400, {
                message: "error"
            });
        }
        res.redirect("/offers")
    })
}
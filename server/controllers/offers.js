var offersModel = require("../models/offersModel");
var myDatabase = require("../controllers/database");
var Sequelize = myDatabase.Sequelize;
var itemModel =  require("../models/productlist");

exports.makeOffer = function( req, res) {
    console.log("making offer")
    var itemID = parseInt(req.params.id);

    var offerData = {
        offerAmount: req.body.offerAmount,
        userID: req.user.id,
        itemID: itemID
    }

    offersModel.create(offerData).then((newOffer, created) => {
        if (!newOffer) {
            return res.send(400, {
                message: "error"
            });
        }
        url = '/messages/' + itemID.toString() + '/';
        res.redirect(url);
    })
}

exports.displayOffers = function( req, res) {
    console.log("offers displayed")

    userSeller = req.user.id
    Sequelize.Query("select *, u.id from offers o join productslist pd on o.userID = pd.UserID")
    
}
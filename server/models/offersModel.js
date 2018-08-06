var myDatabase = require('../controllers/database');
var sequelize = myDatabase.sequelize;
var Sequelize = myDatabase.Sequelize;

const offers = sequelize.define('offers', {
    transactionID: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    itemID: {
        type: Sequelize.INTEGER,
        defaultValue: '',
        allowNull: false
    },
    itemName: {
        type: Sequelize.STRING,
    },
    offerAmount: {
        type: Sequelize.DECIMAL(10,2),
        defaultValue: '',
        allowNULL: false
    },
    sellerID: {
        type: Sequelize.STRING,
        defaultValue: '',
        allowNULL: false
    },
    sellerName: {
        type: Sequelize.STRING
    },
    buyerID: {
        type: Sequelize.STRING,
        defaultValue: '',
        allowNULL: false,
    },
    buyerName: {
        type: Sequelize.STRING
    },
    offerType: {
        type: Sequelize.STRING,
        defaultValue: '',
        allowNULL: false
    },
    offerStatus: {
        type: Sequelize.STRING,
        allowNULL: false,
        defaultValue: "Active"
    },
    Date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    }
});

offers.sync({ force: false, logging: console.log}).then(() => {
    console.log("offersModel synced");
});

module.exports = sequelize.model('offers', offers);
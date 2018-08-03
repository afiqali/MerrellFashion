var myDatabase = require('../controllers/database');
var sequelize = myDatabase.sequelize;
var Sequelize = myDatabase.Sequelize;

const offers = sequelize.define('offers', {
    transactionID: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userID: {
        type: Sequelize.STRING,
        allowNULL: false,
    },
    itemID: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    acceptOffer: {
        type: Sequelize.BOOLEAN,
        allowNULL: false,
        defaultValue: false
    },
    offerAmount: {
        type: Sequelize.DECIMAL(10,2),
        allowNULL: false
    },
});

offers.sync({ force: false, logging: console.log}).then(() => {
    console.log("offersModel synced");
});

module.exports = sequelize.model('offers', offers);
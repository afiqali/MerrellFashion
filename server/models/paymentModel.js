// models/payment.js
var myDatabase = require('../controllers/database');
var sequelize = myDatabase.sequelize;
var Sequelize = myDatabase.Sequelize;

const Order = sequelize.define('Order', {
    payment_id: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false
    },
    payer_id: {
        type: Sequelize.STRING,
        allowNull: false
    },
    user_id:{
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    totalAmount: {
        type: Sequelize.DECIMAL(18,2),
        allowNull: false,
        defaultValue: "1"
    },
    // credit_card_id: {
    //     type: Sequelize.STRING,
    //     allowNull: false,
    //     defaultValue: "A7X"
    // },
    orderDate: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'pending',
        trim: true
    },
    orderMethod: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'NETS',
        trim: true
    },
    // item_id: {
    //     type: Sequelize.INTEGER,
    //     allowNull: false,
    //     references: {
    //         model: 'Item',
    //         key: 'id'
    //     }
    // }

});
// force: true will drop the table if it already exists
Order.sync({ force: false, logging: console.log}).then(() => {
    // Table created
    console.log("Order table synced");
});

module.exports = sequelize.model('Order', Order);
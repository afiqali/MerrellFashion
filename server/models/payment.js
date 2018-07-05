// models/payment.js
var myDatabase = require('../controllers/database');
var sequelize = myDatabase.sequelize;
var Sequelize = myDatabase.Sequelize;

const Order = sequelize.define('Order', {
    order_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
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
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: "1"
    },
    credit_card_id: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "A7X"
    },
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
    }

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
    console.log("Order table synced");
    Order.upsert({
        order_id: 1,
        user_id: 1,
        totalAmount: 20,
        credit_card_id: '1234',
        orderDate: "2018-06-28 11:10:11.3160000 +00:00",
        status: "Buyer paid",
        orderMethod: "Paypal"
    });
});

module.exports = sequelize.model('Order', Order);
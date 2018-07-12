var myDatabase = require('../controllers/database');
var sequelize = myDatabase.sequelize;
var Sequelize = myDatabase.Sequelize;

const Transactions = sequelize.define('Transactions', {
    id: {  type: Sequelize.INTEGER,
           autoIncrement: true,
           primaryKey: true
        },
    user_id: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    item_id: {
        type: Sequelize.STRING,
        allowNull: false
    },
    status: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    date_created: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        createdAt: false,
        updatedAt: false,
    },
});

// force: true will drop the table if it already exists
Transactions.sync({ force: true, logging: console.log}).then(() => {
    // Table created
    console.log("transactions table synced");
        Transactions.upsert({
        id: "1",
        user_id: "1001A",
        item_id: "1",
        status: "UPDATE",
    });
    Transactions.upsert({
        id: "2",
        user_id: "1002A",
        item_id: "2",
        status: "UPDATE",
    });
    Transactions.upsert({
        id: "3",
        user_id: "1003A",
        item_id: "3",
        status: "UPDATE",
    });
    Transactions.upsert({
        id: "4",
        user_id: "1004A",
        item_id: "4",
        status: "UPDATE",
    });
    Transactions.upsert({
        id: "10",
        user_id: "10010A",
        item_id: "10",
        status: "UPDATE",
    });
    Transactions.upsert({
        id: "5",
        user_id: "1005A",
        item_id: "5",
        status: "UPDATE",
    });
    Transactions.upsert({
        id: "6",
        user_id: "1006A",
        item_id: "6",
        status: "UPDATE",
    });
    Transactions.upsert({
        id: "7",
        user_id: "1007A",
        item_id: "7",
        status: "UPDATE",
    });
    Transactions.upsert({
        id: "8",
        user_id: "1008A",
        item_id: "8",
        status: "UPDATE",
    });
    Transactions.upsert({
        id: "9",
        user_id: "1009A",
        item_id: "9",
        status: "UPDATE",
    });
});

module.exports = sequelize.model('Transactions', Transactions);

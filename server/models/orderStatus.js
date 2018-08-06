var myDatabase = require('../controllers/database');
var sequelize = myDatabase.sequelize;
var Sequelize = myDatabase.Sequelize;

const orderStatus = sequelize.define('orderStatus', {
    order_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    status: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    }
    // profilePicture: {
    //     type: Sequelize.STRING
    // }
});

// force: true will drop the table if it already exists
orderStatus.sync({ force: false, logging: console.log }).then(() => {
    console.log("orderStatus table synced");
    orderStatus.upsert({
        order_id: 1,
        status: 1,
        user_id: 1
    });
});

module.exports = sequelize.model('orderStatus', orderStatus);
// models/chatMsg.js
var myDatabase = require('../controllers/database');
var sequelize = myDatabase.sequelize;
var Sequelize = myDatabase.Sequelize;

const ChatMsg = sequelize.define('ChatMsg', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    
    name: {
        type: Sequelize.STRING
    },
    message: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: '',
        trim: true
    },
    // offerPrice: {
    //     type: Sequelize.INTEGER,
    //     allowNull: true,
    //     defaultValue: 0,
    //     trim: true
    // }
    userId:{
        type: Sequelize.INTEGER
    },
    itemId: {
        type: Sequelize.INTEGER
    },
    sellerId: {
        type: Sequelize.INTEGER
    },
});

// force: true will drop the table if it already exists
ChatMsg.sync({ force:true, logging: console.log}).then(() => {
    // Table created
    console.log("ChatMsgs table synced");
});

module.exports = sequelize.model('ChatMsg', ChatMsg);
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
    user_id:{
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
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
    offerPrice: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
        trim: true
    }
});

// force: true will drop the table if it already exists
ChatMsg.sync({ force:false, logging: console.log}).then(() => {
    // Table created
    console.log("ChatMsgs table synced");
    ChatMsg.upsert({
        id: 1,
        user_id: 1,
        name: "Amos",
        message: "Hi",
        offerPrice: 10
    })
});

module.exports = sequelize.model('ChatMsg', ChatMsg);
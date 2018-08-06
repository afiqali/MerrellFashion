// models/images.js
var myDatabase = require('../controllers/database');
var sequelize = myDatabase.sequelize;
var Sequelize = myDatabase.Sequelize;

const productlist = sequelize.define('productlist', {
    Itemid: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    created: {
        type: Sequelize.DATE,
        defaultValue: sequelize.now
    },
    ItemName: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: '',
        trim: true
    },
    imageName: {
        type: Sequelize.STRING
    },
    user_id:{
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    price: {
        type: Sequelize.DECIMAL(10,2),
        allowNull: false
    },
    category: {
        type: Sequelize.STRING
    },
    status: {
        type: Sequelize.STRING,
        defaultValue: 'a'
    },
    Description: {
        type: Sequelize.STRING,
        allowNull: true
    },
    PickUpLocation: {
        type: Sequelize.STRING,
        allowNull: false,
    },
});

// force: true will drop the table if it already exists
productlist.sync({ force: false, logging: console.log}).then(() => {
    // Table created
    console.log("product table synced");
    productlist.upsert({
        Itemid: 1,
        ItemName: "Blue dress",
        user_id: 1,
        price: 10.50,
        Description: "Branded brand-new dress",
        PickUpLocation: "1 Holly Road Singapore 123456"
    });
});

module.exports = sequelize.model('productlist', productlist);

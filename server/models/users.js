// models/users.js
var myDatabase = require('../controllers/database');
var sequelize = myDatabase.sequelize;
var Sequelize = myDatabase.Sequelize;

const Users = sequelize.define('Users', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: Sequelize.STRING
    },
    email: {
        type: Sequelize.STRING
    },
    password: {
        type: Sequelize.STRING
    },
    gender: {
        type: Sequelize.STRING
    },
    dob: {
        type: Sequelize.DATEONLY
    },
    contactNumber: {
        type: Sequelize.INTEGER
    },
    address: {
        type: Sequelize.STRING
    },
    img: {
        type: Sequelize.STRING
    }
    // profilePicture: {
    //     type: Sequelize.STRING
    // }
});

// force: true will drop the table if it already exists
Users.sync({ force: false, logging: console.log }).then(() => {
    console.log("users table synced");
    Users.upsert({
        id: 1,
        name: 'Ben',
        email: 'a@b.com',
        password: '1234',
        gender: "Male",
        contactNumber: 91234567,
        address: "1 Holly Road Singapore 123456",
        img: "face.jpg"
        // format for DATEONLY?
    });

    Users.upsert({
        id: 2,
        name: 'admin',
        email: 'admin@b.com',
        password: '1234',
        address: "1 Holly Road Singapore 123456"
    });
});
module.exports = sequelize.model('Users', Users);
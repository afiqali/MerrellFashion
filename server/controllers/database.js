var Sequelize = require('sequelize');
var sequelizeTransforms = require('sequelize-transforms');

const sequelize =new Sequelize({
    dialect: 'mssql',
    dialectModulePath: 'tedious',
    dialectOptions: {
      driver: 'SQL Server Native Client 11.0',
      instanceName: 'SQLEXPRESS03'
    },
    host: 'localhost',
    username: 'p4',
<<<<<<< HEAD
    password: 'p4pw',
=======
<<<<<<< HEAD
    password: 'p4pw',

=======
    password: '1234',
>>>>>>> c3d45c900bbd34ab67c00e731238699f25a8d972
>>>>>>> 21931fdb534681b2ce76bafdb734a068b6ec1995
    database: 'p4db',
    pool: {
        min: 0,
        max: 10,
        idle: 10000
      }
  });

sequelize.authenticate().then(() => {
    console.log('Connection has been established successfully.');
}).catch(err => {
    console.error('Unable to connect to the database:', err);
});

sequelizeTransforms(sequelize);

module.exports.sequelize = sequelize;
module.exports.Sequelize = Sequelize;
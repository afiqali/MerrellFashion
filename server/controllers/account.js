var myDatabase = require('./database');
var sequelize = myDatabase.sequelize;

exports.display_account = function (req, res) {
    console.log(req.user.email);
                res.render('account'
                )
            }


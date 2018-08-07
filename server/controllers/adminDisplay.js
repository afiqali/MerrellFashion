// Import models
var Order = require('../models/paymentModel');
var User = require('../models/users');
var productlist = require('../models/productlist');

var myDatabase = require('./database');
var sequelize = myDatabase.sequelize;
var fs = require('fs');
var mime = require('mime');

var IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

exports.display = function (req, res) {
    if (req.user.email == "admin@b.com") {
        sequelize.query("select * from Users", { model: User })
            .then((users) => {
                sequelize.query("select * from productlists", { model: productlist })
                    .then((productlists) => {
                        res.render('display', {
                            title: 'Admin Display Page',
                            users: users,
                            productlists: productlists,
                            urlPath: req.protocol + "://" + req.get("host") + req.url
                        })
                    })
                    .catch((err) => {
                        return res.status(400).send({
                            message: err
                        });
                    })
            });
    }
}

exports.edit = function (req, res) {
    var editUserData = {
        name: req.body.name,
        email: req.body.email,
        gender: req.body.gender,
        dob: req.body.dob,
        contactNumber: req.body.contactNumber,
        address: req.body.address
    }
    if (req.file) {
        // Upload image file 
        var src;
        var dest;
        var targetPath;
        var targetName;
        var tempPath = req.file.path;

        // get the mime type of the file
        var type = mime.lookup(req.file.mimetype);

        // get file extension
        var extension = req.file.path.split(/[. ]+/).pop();

        // check support file types
        if (IMAGE_TYPES.indexOf(type) == -1) {
            return res.status(415).send('Supported image formats: jpeg, jpg, jpe, png. ');
        }

        // Set new path to images
        targetPath = './public/images/' + req.file.originalname;

        // using read stream API to read file
        src = fs.createReadStream(tempPath);

        // using a write stream API to write file
        dest = fs.createWriteStream(targetPath);
        src.pipe(dest);

        // Show error
        src.on('error', function (err) {
            if (err) {
                return res.status(500).send({
                    message: error
                });
            }
        });

        // Save file process
        src.on('end', function () {
            // create a new instance of the Images model with request body
            var img = {
                imageName: req.file.originalname,
            }

            // remove from temp folder
            fs.unlink(tempPath, function (err) {
                if (err) {
                    return res.status(500).send('Something bad happened here')
                }
            });

            // Update matched User db record one-by-one
            User.update({ name: editUserData.name }, { where: { id: req.user.id } })
                .then(
                    User.update({ email: editUserData.email }, { where: { id: req.user.id } })
                )
                .then(
                    User.update({ gender: editUserData.gender }, { where: { id: req.user.id } })
                )
                .then(
                    User.update({ dob: editUserData.dob }, { where: { id: req.user.id } })
                )
                .then(
                    User.update({ contactNumber: editUserData.contactNumber }, { where: { id: req.user.id } })
                )
                .then(
                    User.update({ address: editUserData.address }, { where: { id: req.user.id } })
                )
                .then(
                    User.update({ img: img.imageName }, { where: { id: req.user.id } })
                )
                .then(
                    req.flash("Profile change", "Profile changed successfully"),
                    res.redirect("/admindisplay")
                )
                .catch((err) => {
                    req.flash("Profile change", "Profile change failed")
                    return res.status(400).send({
                        message: err
                    }).redirect("/admindisplay");
                });
        })
    }
    else {
        // Update matched User db record one-by-one
        User.update({ name: editUserData.name }, { where: { id: req.user.id } })
            .then(
                User.update({ email: editUserData.email }, { where: { id: req.user.id } })
            )
            .then(
                User.update({ gender: editUserData.gender }, { where: { id: req.user.id } })
            )
            .then(
                User.update({ dob: editUserData.dob }, { where: { id: req.user.id } })
            )
            .then(
                User.update({ contactNumber: editUserData.contactNumber }, { where: { id: req.user.id } })
            )
            .then(
                User.update({ address: editUserData.address }, { where: { id: req.user.id } })
            )
            .then(
                req.flash("Profile change", "Profile changed successfully"),
                res.redirect("/admindisplay")
            )
            .catch((err) => {
                req.flash("Profile change", "Profile change failed")
                return res.status(400).send({
                    message: err
                }).redirect("/admindisplay");
            });
    }
}

exports.delete = function(req, res) {
    var record_num = req.params.User_id;
    console.log("deleting " + record_num);
    
    User.destroy({ where: { id: req.params.User_id } })
    .then(function(rowDeleted){         // rowDeleted: returns row{s} deleted
        if(rowDeleted === 1)
            console.log('Deleted successfully');
    }, function(err){
        console.log(err); 
    })
}

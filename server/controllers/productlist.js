// Import modules
var fs = require('fs');
var mime = require('mime');
var gravatar = require('gravatar');

// set image file types
var IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

var productlist = require('../models/productlist');
var myDatabase = require('./database');
var sequelize = myDatabase.sequelize;

// Show images gallery -  function to get all the uploaded images from the database and show it on the page. 
exports.show = function (req, res) {

    sequelize.query('select i.Itemid, i.visible, i.Description, i.PickUpLocation, i.ItemName, i.created, i.imageName, i.price, i.category, u.email AS [user_id] from productlists i join Users u on i.user_id = u.id'
    , { model: productlist}).then((productlists)=> {

        res.render('products-gallery', {
            title: 'Product For Sale',
            productlists: productlists,
            user: req.user,
            urlPath: req.protocol + "://" + req.get("host") + req.url
        });

    }).catch((err) => {
        return res.status(400).send({
            message: err
        });
    });
};

exports.showDress = function (req, res) {

    sequelize.query("select * from productlists where category = 'Dress'"
    , { model: productlist}).then((productlists)=> {

        res.render('products-gallery', {
            title: 'Product For Sale',
            productlists: productlists,
            user: req.user,
            urlPath: req.protocol + "://" + req.get("host") + req.url
        });

    }).catch((err) => {
        return res.status(400).send({
            message: err
        });
    });
};

exports.showHeels = function (req, res) {

    sequelize.query("select * from productlists where category = 'High Heels'"
    , { model: productlist}).then((productlists)=> {

        res.render('products-gallery', {
            title: 'Product For Sale',
            productlists: productlists,
            user: req.user,
            urlPath: req.protocol + "://" + req.get("host") + req.url
        });

    }).catch((err) => {
        return res.status(400).send({
            message: err
        });
    });
};

// Image upload
exports.uploadImage = function (req, res) {
    var src;
    var dest;
    var targetPath;
    var targetName;
    var tempPath = req.file.path;
    console.log(req.file);
    // get the mime type of the file
    var type = mime.lookup(req.file.mimetype);
    // get file extension
    var extension = req.file.path.split(/[. ]+/).pop();
    // check support file types
    if (IMAGE_TYPES.indexOf(type) == -1) {
        return res.status(415).send('Supported image formats: jpeg, jpg, jpe, png. ');
    }
    // Set new path to images
    targetPath = './publicPRODUCT/images/' + req.file.originalname;
    // using read stream API to read file
    src = fs.createReadStream(tempPath);
    // using a write stream API to write file
    dest = fs.createWriteStream(targetPath);
    src.pipe(dest);
    // Show error
    src.on('error', function(err) {
        if (err) {
            return res.status(500).send({
                message: error
            });
        }
    });
    // Save file process
    src.on('end', function() {
        // create a new instance of the Images model with request body
        var ProductData = {
            ItemName: req.body.ItemName,
            imageName: req.file.originalname,
            Itemid: req.Itemid,
            user_id: req.user.id,
            price: req.body.price,
            category: req.body.category,
            Description: req.body.Description,
            PickUpLocation: req.PickUpLocation,
            created: req.created,
            visible: req.visible
        }
        // Save to database
        productlist.create(ProductData).then((newProduct, created) => {
            if (!newProduct) {
                return res.send(400, {
                    message: "error"
                });
            }
            res.redirect('products-gallery');
        })

         // remove from temp folder
         fs.unlink(tempPath, function (err) {
            if (err) {
                return res.status(500).send('Something bad happened here');
            }
            // Redirect to gallery's page
            res.redirect('products-gallery');
        });
    });
};

// List one specific student record from database
exports.editRecord = function(req, res) {
    var Itemidentity = req.params.id;
    productlist.findById(Itemidentity).then(function (ItemDetails) {
        res.render('editRecord', {
            title: "Edit Record Of Product",
            productlists: ItemDetails,
            hostPath: req.protocol + "://" + req.get("host"),
            urlPath: req.protocol + "://" + req.get("host") + req.url
        });
    }).catch((err) => {
        return res.status(400).send({
            message: err
        });
    });
}

exports.specificlist = function(req, res) {
    var Itemspecific = req.params.id;
    productlist.findById(Itemspecific).then(function (ItemDetails) {
        res.render('productpage', {
            title: "Specific Record Of Product",
            productspecific: ItemDetails,
            hostPath: req.protocol + "://" + req.get("host"),
            urlPath: req.protocol + "://" + req.get("host") + req.url
        });
    }).catch((err) => {
        return res.status(400).send({
            message: err
        });
    });
}

// Update student record in database
exports.update = function(req, res) {
    var record_num = req.params.id;
    var updateData = {
        ItemName: req.body.ItemName,
        price: req.body.price,
        category: req.body.category,
        Description: req.body.Description,
    }
    productlist.update(updateData, { where: {Itemid: record_num} }).then((updatedRecord) => {
        if (!updatedRecord || updatedRecord ==0) {
            return res.send(400, {
                message: "error"
            });
        }
        res.status(200).send({ message: "Updated item details:" + record_num});
    })
}

// Delete a student record from database
exports.delete = function(req, res) {
    var record_num = req.params.id;
    console.log("deleting " + record_num);
    var softdelete = {
       visible: false
    }
    productlist.update(softdelete, { where: {Itemid: record_num} }).then((updatedRecord) => {
        if (!updatedRecord || updatedRecord ==0) {
            return res.send(400, {
                message: "error"
            });
        }
        res.status(200).send({ message: "Deleted item details:" + record_num});
        
    });
}

// Images authorization middleware
exports.hasAuthorization = function(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/login');
};
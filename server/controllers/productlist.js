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
    var currentuser = req.user.id
    sequelize.query("select *, u.email AS [user_id] from productlists i join Users u on i.user_id = u.id WHERE status = 'a' and i.user_id <>'" + currentuser + "'"
        , { model: productlist }).then((productlists) => {


            res.render('products-gallery', {
                title: 'Product For Sale',
                productlists: productlists,
                user: req.user,
                address: req.address,
                urlPath: req.protocol + "://" + req.get("host") + req.url
            });

        }).catch((err) => {
            return res.status(400).send({
                message: err
            });
        });
};

exports.showCategory = function (req, res) {
    var currentuser = req.user.id
    var Itemcategory = req.params.category;
    sequelize.query("select *, u.email AS [user_id] from productlists i join Users u on i.user_id = u.id WHERE status = 'a' and i.category ='" + Itemcategory + "' and i.user_id <>'" + currentuser + "'"
        , { model: productlist }).then((productlists) => {

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
        var ProductData = {
            ItemName: req.body.ItemName.replace(/[&\/\\#,+()$~%.'":*?<>{};]/g, ''),
            imageName: req.file.originalname,
            Itemid: req.Itemid,
            user_id: req.user.id,
            price: req.body.price,
            category: req.body.category,
            Description: req.body.Description,
            PickUpLocation: req.body.PickUpLocation,
            created: req.created,
            status: req.status
        }
        // Save to database
        productlist.create(ProductData).then((newProduct, created) => {
            if (!newProduct) {
                return res.send(400, {
                    message: "error"
                });
            }
            res.redirect('profile');
        })

        // remove from temp folder
        fs.unlink(tempPath, function (err) {
            if (err) {
                return res.status(500).send('Something bad happened here');
            }
            // Redirect to gallery's page
            res.redirect('profile');
        });
    });
};

// List one specific student record from database
exports.editRecord = function (req, res) {
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
};

exports.specificlist = function(req, res) {
    var currentuser = req.user.id;
    var Itemspecific = req.params.id;
    sequelize.query("select p.imageName, p.price, p.Description, p.ItemName, p.status, p.category, p.Itemid, p.user_id, p.createdAt, u.name from productlists p join Users u on p.user_id = u.id where p.Itemid ='" + Itemspecific + "'"
    , { model: productlist }).then((RawItemDetails) => { 
        var ItemDetails = RawItemDetails[0]['dataValues'];
        sequelize.query("select *, u.email AS [user_id] from productlists i join Users u on i.user_id = u.id WHERE status = 'a' and i.category ='" +ItemDetails.category+"' and i.user_id <>'" +currentuser+"' and i.Itemid <> '"+ ItemDetails.Itemid+"' ORDER BY NEWID()"
        , { model: productlist}).then((productlists) => {
            res.render('productpage', {
                title: "Specific Record Of Product",
                productspecific: ItemDetails,
                productlists: productlists,
                user: req.user,
                hostPath: req.protocol + "://" + req.get("host"),
                urlPath: req.protocol + "://" + req.get("host") + req.url
            });
        }).catch((err) => {6
            return res.status(400).send({
                message: err
            });
        });

        })
    }
        
// Update/Editing listing record in database
exports.updatetest = function (req, res) {
    var src;
    var dest;
    var targetPath;
    var targetName;
    try {
        var tempPath = req.file.path;
        console.log('GOOD MORNING BITCHES');
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
        src.on('error', function (err) {
            if (err) {
                return res.status(500).send({
                    message: error
                });
            }
        });

        var record_num = req.params.id;
        var updateData = {
            ItemName: req.body.ItemName.replace(/[&\/\\#,+()$~%.'":*?<>{};]/g, ''),
            price: req.body.price,
            category: req.body.category,
            Description: req.body.Description,
            imageName: req.file.originalname,
        }
        productlist.update(updateData, { where: { Itemid: record_num } }).then((updatedRecord) => {
            console.log("RECORD " + updatedRecord);
            if (!updatedRecord || updatedRecord == 0) {
                return res.send(400, {
                    message: "error"
                });
            }
            res.status(200).send({ message: "Updated item details:" + record_num });
        })

    } catch (err) {
        var record_num = req.params.id;
        var updateData = {
            ItemName: req.body.ItemName.replace(/[&\/\\#,+()$~%.'":*?<>{};]/g, ''),
            price: req.body.price,
            category: req.body.category,
            Description: req.body.Description,
        }
        productlist.update(updateData, { where: { Itemid: record_num } }).then((updatedRecord) => {
            console.log("RECORD " + updatedRecord);
            if (!updatedRecord || updatedRecord == 0) {
                return res.send(400, {
                    message: "error"
                });
            }
            res.status(200).send({ message: "Updated item details:" + record_num});
            })
        }
    }


// Delete a student record from database
exports.delete = function (req, res) {
    var record_num = req.params.id;
    console.log("deleting " + record_num);
    var softdelete = {
        status: 'd'
    }
    productlist.update(softdelete, { where: { Itemid: record_num } }).then((updatedRecord) => {
        if (!updatedRecord || updatedRecord == 0) {
            return res.send(400, {
                message: "error"
            });
        }
        res.status(200).send({ message: "Deleted item details:" + record_num });

    });
}

exports.SortHighToLow = function (req, res) {
    var currentuser = req.user.id
    sequelize.query("select *, u.email AS [user_id] from productlists i join Users u on i.user_id = u.id WHERE status = 'a' and i.user_id <>'" + currentuser + "' order by i.price desc"
        , { model: productlist }).then((productlists) => {

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

exports.SortLowToHigh = function (req, res) {
    var currentuser = req.user.id
    sequelize.query("select *, u.email AS [user_id] from productlists i join Users u on i.user_id = u.id WHERE status = 'a' and i.user_id <> '" + currentuser + "' order by i.price asc"
        , { model: productlist }).then((productlists) => {

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

exports.SortPriceRange = function (req, res) {
    var min = req.params.min;
    var max = req.params.max;
    var currentuser = req.user.id;
    sequelize.query("select *, u.email AS [user_id] from productlists i join Users u on i.user_id = u.id WHERE status = 'a' and i.user_id <> '" + currentuser + "' and i.price BETWEEN " + min + " AND " + max
        , { model: productlist }).then((productlists) => {

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

exports.SortRecent = function (req, res) {
    var currentuser = req.user.id
    sequelize.query("select *, u.email AS [user_id] from productlists i join Users u on i.user_id = u.id WHERE status = 'a' and i.user_id <> '" + currentuser + "' order by i.created"
        , { model: productlist }).then((productlists) => {

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

exports.searchfunction = function (req, res) {
    var search = req.params.search;
    var currentuser = req.user.id
    console.log(search)
    sequelize.query("select *, u.email AS [user_id] from productlists i join Users u on i.user_id = u.id WHERE status = 'a' and i.ItemName like '%" + search + "%' and i.user_id <> '" + currentuser + "'"
        , { model: productlist }).then((productlists) => {

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

exports.profileItems = function (req, res) {
    currentuser = req.user.id
    sequelize.query("select *, u.email AS [user_id] from productlists i join Users u on i.user_id = u.id where i.user_id ='"+currentuser+"' and status <> 'd' order by i.status"
    , { model: productlist}).then((productlists)=> {

        res.render('profile', {
            title: 'Profile Page', 
            user : req.user, 
            avatar: gravatar.url(req.user.email ,  {s: '100', r: 'x', d: 'retro'}, true),
            productlists: productlists,
            urlPath: req.protocol + "://" + req.get("host") + req.url
        });

        }).catch((err) => {
            return res.status(400).send({
                message: err
            });
        });
};

exports.OtherProfileItems = function (req, res) {
    ProfileOwner = req.params.ProfileOwner
    sequelize.query("select *, u.email AS [user_id] from productlists i join Users u on i.user_id = u.id where i.user_id ='"+ProfileOwner+"' and status <> 'd' order by i.status"
    , { model: productlist}).then((productlists)=> {
        sequelize.query("select p.imageName, p.price, p.Description, p.ItemName, p.status, p.category, p.Itemid, p.user_id, p.createdAt, u.name, u.email from productlists p join Users u on p.user_id = u.id where p.user_id ='" + ProfileOwner + "'"
    , { model: productlist }).then((RawItemDetails) => { 
        var UserDetails = RawItemDetails[0]['dataValues'];

        res.render('OtherProfilePage', {
            title: 'Profile Page', 
            user : UserDetails, 
            avatar: gravatar.url(UserDetails.email ,  {s: '100', r: 'x', d: 'retro'}, true),
            productlists: productlists,
            urlPath: req.protocol + "://" + req.get("host") + req.url
        });
    
    }).catch((err) => {
        return res.status(400).send({
            message: err
        });
    });
});
}

// Images authorization middleware
exports.hasAuthorization = function (req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/login');
};
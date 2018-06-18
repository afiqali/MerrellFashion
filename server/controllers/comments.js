// get gravatar icon from email
var gravatar = require('gravatar');
// get Comments model
var Comments = require("../models/comments")
var myDatabase = require('./database');
var sequelize = myDatabase.sequelize;

// List Comments 
exports.list = function(req, res) {
    // List all comments and sort by Date
    sequelize.query("select c.id, c.title, c.content, u.email AS [user_id] from Comments c join Users u on c.user_id = u.id"
    , {model:Comments}).then((comments) => {

        res.render('comments', {
            title: 'Comments Page',
            comments: comments,
            gravatar: gravatar.url(comments.user_id, {s:'80', r:'x', d:'retro'}, true),
            urlPath: req.protocol + "://" + req.get("host") + req.url
        })
    }).catch((err)=>{
        return res.status(400).send({
            message: err
        });
    });
};

// Create Comments
exports.create = function (req, res) {
    console.log("creating comments")

    var commentData = {
        title: req.body.title,
        content: req.body.content,
        user_id: req.user.id
    }

    Comments.create(commentData).then((newComment, created) => {
        if (!newComment) {
            return res.send(400, {
                message: "error"
            });
        }

        res.redirect('/comments');
    })
}

// Delete comments based on ID of comment
exports.delete = function(req,res) {
    var record_num = req.params.comments_id;
    console.log("deleting comments" + record_num);
    Comments.destroy({where: {id: record_num}}).then((deletedComment)=>{
        if(!deletedComment){
            return res.send(400, {
                message: "error"
            });
        }

        res.status(200).send({ message: "Deleted comments :"+ record_num});
    })
}

// Comments authorization middleware
exports.hasAuthorization = function(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/login');
};
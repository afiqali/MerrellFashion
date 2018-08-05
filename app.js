// Import basic modules
var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');


// Import multer
var multer = require('multer');
var upload = multer({ dest:'./public/uploads/', limits: {fileSize: 150000000000000, files:1} });

// Import home controller
var index = require('./server/controllers/index');
// Import login controller
var auth = require('./server/controllers/auth');
// Import comments controller
var comments = require('./server/controllers/comments');
// Import videos controller
var videos = require('./server/controllers/videos');
//Import Listing controller
var list = require('./server/controllers/productlist');
// Import payment controller
var payment = require('./server/controllers/paymentController');
var stripe = require('stripe')('sk_test_RS2ZwJbELQPZS0aUxODCdZC9');
const exphbs = require('express-handlebars');
// Import Receipt Controller
var receipt = require('./server/controllers/receiptController');
// Import display (admin) controller
var display = require('./server/controllers/display');
// Import account controller
var account = require('./server/controllers/account');
// Import transactions controller
var transactions = require('./server/controllers/transactions')
// Import offers controller
var offers = require('./server/controllers/offers');
// Import listPayments controller
var listPayments = require('./server/controllers/listPaymentsController')

// Modules to store session
var myDatabase = require('./server/controllers/database');
var expressSession = require('express-session');
var SessionStore = require('express-session-sequelize')(expressSession.Store);
var sequelizeSessionStore = new SessionStore({
    db: myDatabase.sequelize,
});

// Import Passport and Warning flash modules
var passport = require('passport');
var flash = require('connect-flash');

var app = express();
var serverPort = 3000;
var httpServer = require('http').Server(app);

// view engine setup
app.set('views', path.join(__dirname, 'server/views/pages'));
app.set('view engine', 'ejs');

// Passport configuration
require('./server/config/passport')(passport);

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('node-sass-middleware')({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    indentedSyntax: true,
    sourceMap: true
}));

// Setup public directory
app.use(express.static(path.join(__dirname, 'public')));
app.use('/public',express.static('public'));
app.use('/publicPRODUCT',express.static('publicPRODUCT'));

// Passport session uses Express session
// secret for session
app.use(expressSession({
    secret: 'sometextgohere',
    store: sequelizeSessionStore,
    resave: false,
    saveUninitialized: false,
}));

// Init passport authentication
app.use(passport.initialize());
// persistent login sessions
app.use(passport.session());
// flash messages
app.use(flash());

// Application Routes
// Index Route
app.get('/', index.show);

// Route for Login
app.get('/login', auth.notLoggedIn, auth.signin);
app.post('/login', passport.authenticate('local-login', {
    //Success go to Profile Page / Fail go to login page
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true
}));

// Route for signup
app.get('/signup', auth.notLoggedIn, auth.signup);
app.post('/signup', passport.authenticate('local-signup', {
    //Success go to Profile Page / Fail go to Signup page
    successRedirect: '/profile',
    failureRedirect: '/signup',
    failureFlash: true
}));

// Route for admin - display orders (get from payment)
app.get('/display', auth.isLoggedIn, display.displayOrder);

// Route for profile
app.get('/profile', auth.isLoggedIn, list.profileItems);

// Route for account
app.get('/account', auth.isLoggedIn, account.displayAccount);
app.post('/account', account.editAccount);

// Route for Change password
app.get('/changepassword', auth.isLoggedIn, account.getPassword);
app.post('/changepassword', account.editPassword);

// Route for payment
app.get('/payment/:id', auth.isLoggedIn, payment.getItem);
app.post('/payment/stripe/:id',  payment.doStripe);
app.post('/payment/paypal/:id',  payment.create);

app.get('/listPayments', auth.isLoggedIn, listPayments.getItem);

// Route for receipt
app.get('/receipt/:id/:payment_id', receipt.getItem);


// Logout Page
app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

// Change password
app.get('/changepassword', auth.isLoggedIn, account.displayAccount
);


// Setup routes for comments
app.get('/comments', comments.hasAuthorization, comments.list);
app.post('/comments', comments.hasAuthorization, comments.create);
app.delete('/comments/:comments_id', comments.hasAuthorization, comments.delete);

// Setup routes for videos
app.get('/videos', videos.hasAuthorization, videos.show);
app.post('/videos', videos.hasAuthorization, upload.single('video'), videos.uploadVideo);

// Setup routes for Transactions
app.get('/transactions', transactions.list);
app.get('/')
// Setup routes for offers
app.post('/messages/:id', offers.makeOffer);

// Setup chat

// Setup routes for product listing general
app.post('/products', list.hasAuthorization, upload.single('image'), list.uploadImage);
app.get('/products-gallery', list.hasAuthorization, list.show);

//Setup routes for filtering item listing
app.get('/products-gallery/search/:search', list.searchfunction);
app.get('/products-gallery/:category',list.hasAuthorization, list.showCategory);
app.get('/products-gallery/Sort/PriceHigh', list.hasAuthorization, list.SortHighToLow);
app.get('/products-gallery/Sort/PriceLow', list.hasAuthorization, list.SortLowToHigh);
app.get("/products-gallery/Sort/PriceRange=:min-:max", list.hasAuthorization, list.SortPriceRange);
app.get("/products-gallery/Sort/Recent", list.hasAuthorization, list.SortRecent);

//Setup routes for product editing
app.get("/profile/edit/:id",list.hasAuthorization, list.editRecord);
app.post("/edit/:id",list.hasAuthorization, upload.single('image'), list.updatetest);

//Setup routes for product delete
app.delete("/profile/:id",list.hasAuthorization, list.delete);

// Setup routes for specific product list
app.get('/products-gallery/:category/view/:id', list.hasAuthorization, list.specificlist)
app.get('/products-gallery/view/:id', list.specificlist);
app.get('/products-gallery/search/:search/view/:id', list.specificlist);
app.get('/profile/view/:id', list.specificlist);
app.get('/products-gallery/Sort/PriceHigh/view/:id', list.hasAuthorization, list.specificlist);
app.get('/products-gallery/Sort/PriceLow/view/:id', list.hasAuthorization, list.specificlist);
app.get("/products-gallery/Sort/:min/:max/view/:id", list.hasAuthorization, list.specificlist);
app.get("/products-gallery/Sort/Recent/view/:id", list.hasAuthorization, list.specificlist);

//Setup routes for view Other Profiles
app.get("/OtherProfile/:ProfileOwner",list.hasAuthorization, list.OtherProfileItems);



// Setup Chat
var io = require('socket.io')(httpServer);
var chatConnections = 0;
var ChatMsg = require('./server/models/chatMsg');
var Users = require('./server/models/users');
var itemModel = require("./server/models/productlist");
var ProductDetails = require('./server/models/productlist');

io.on('connection', function(socket) {
    chatConnections++;
    console.log("Num of chat users connected: "+chatConnections);

    socket.on('disconnect', function() {
        chatConnections--;
        console.log("Num of chat users connected: "+chatConnections);
    });
})

app.get('/messages/:id', function (req, res) {
    ChatMsg.findAll().then((chatMessages) => {
        Users.findById(req.user.id).then(function(user){
            ProductDetails.findById(req.params.id).then(function(productlist){
            // console.log(req.user)
            res.render('chatMsg', {
                url: req.protocol + "://" + req.get("host") + req.url,
                data: chatMessages,
                user: user,
                productlist: productlist
            });
            })
        })
    })
});

app.get('/messages', function (req, res) {
    ChatMsg.findAll().then((chatMessages) => {
        Users.findById(req.user.id).then(function(user){
            // console.log(req.user)
            res.render('chatMsg', {
                url: req.protocol + "://" + req.get("host") + req.url,
                data: chatMessages,
                user: user,
                productlist: ""
            });
    })
    });
});
app.post('/messages/:id', function (req, res) {
    Users.findById(req.user.id).then(function(user){
    var chatData = {
        name: user.name,
        message: req.body.message
    }
    //Save into database
    ChatMsg.create(chatData).then((newMessage) => {
        if (!newMessage) {
            sendStatus(500);
        }
        io.emit('message', req.body)
        res.sendStatus(200)
    })
});
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});


// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;

app.set('port', serverPort);

var server = httpServer.listen(app.get('port'), function () {
    console.log('http server listening on port ' + server.address().port);
});

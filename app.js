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
app.get('/', list.ViewHomepage);

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
app.post('/signup', upload.single('image'), passport.authenticate('local-signup', {
    //Success go to Profile Page / Fail go to Signup page
    successRedirect: '/profile',
    failureRedirect: '/signup',
    failureFlash: true
    })
);

// Route for logout
app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

// Route for account
app.get('/account', auth.isLoggedIn, account.displayAccount);
app.post('/account', upload.single('image'), account.editAccount);

// Route for Change password
app.get('/changepassword', auth.isLoggedIn, account.getPassword);
app.post('/changepassword', account.editPassword);

// Route for Track order
app.get('/trackorder', auth.isLoggedIn, account.displayOrder)

// Route for Track order
app.get('/trxhistory', auth.isLoggedIn, listPayments.trxHistory)

// Route for admin - display orders (get from payment)
app.get('/display', auth.isLoggedIn, display.displayOrder);

// Route for profile
app.get('/profile', auth.isLoggedIn, list.profileItems);

// Route for payment
app.get('/payment/:id/:transactionID', auth.isLoggedIn, payment.getItem);
app.post('/payment/stripe/:id/:transactionID',  payment.doStripe);
app.post('/payment/paypal/:id/:transactionID',  payment.create);

app.get('/listPayments', auth.isLoggedIn, listPayments.getItem);

// Route for receipt
app.get('/receipt/:id/:payment_id/:transactionID',auth.isLoggedIn, receipt.getItem);

// Setup routes for Transactions
app.get('/transactions', transactions.list);
app.get('/')
// Setup routes for offers
app.get('/offerSeller', offers.sellerView);
app.get('/offerBuyer', offers.buyerView);
app.post('/messages/:id', offers.makeOffer);
app.get('/offerDetails/:id', offers.offerDetails);
app.post('/offerDetails/:id', offers.acceptOffer);
app.delete('/offerDetails/:id', offers.rejectOffer);
app.get("/transactionAdmin", offers.transactionAdmin)

// Setup routes for product listing general
app.post('/products', list.hasAuthorization, upload.single('image'), list.uploadImage);
app.get('/products-gallery',list.hasAuthorization, list.show);

//Setup routes for filtering item listing
app.get('/products-gallery/search/:search', list.hasAuthorization, list.searchfunction);
app.get('/products-gallery/:category',list.hasAuthorization, list.showCategory);
app.get('/products-gallery/Sort/PriceHigh', list.hasAuthorization, list.SortHighToLow);
app.get('/products-gallery/Sort/PriceLow', list.hasAuthorization, list.SortLowToHigh);
app.get("/products-gallery/Sort/PriceRange=:min-:max", list.hasAuthorization, list.SortPriceRange);
app.get("/products-gallery/Sort/Recent", list.hasAuthorization, list.SortRecent);

//Setup routes for product editing
app.get("/profile/edit/:id",list.hasAuthorization, list.editRecord);
app.get("/OtherProfile/:id/edit/:id",list.hasAuthorization, list.editRecord);
app.get("/products-gallery/edit/:id",list.hasAuthorization, list.editRecord);
app.get("/products-gallery/Sort/PriceHigh/edit/:id",list.hasAuthorization, list.editRecord);
app.get("/products-gallery/Sort/PriceLow/edit/:id",list.hasAuthorization, list.editRecord);
app.get("/products-gallery/Sort/Recent/edit/:id",list.hasAuthorization,list.editRecord);
app.get("/products-gallery/Sort/:min/:max/edit/:id",list.hasAuthorization, list.editRecord);
app.get('/products-gallery/search/:search/edit/:id',list.hasAuthorization, list.editRecord);
app.get('/products-gallery/Sort/PriceRange=:min-:max/edit/:id',list.hasAuthorization, list.editRecord);
app.post("/edit/:id",list.hasAuthorization, upload.single('image'), list.updatetest);

//Setup routes for product delete
app.delete("/profile/:id", list.hasAuthorization, list.delete);
app.delete("/products-gallery/:id",list.hasAuthorization, list.delete);
app.delete("/products-gallery/Sort/PriceHigh/:id",list.hasAuthorization, list.delete);
app.delete("/products-gallery/Sort/PriceLow/:id",list.hasAuthorization, list.delete);
app.delete("/products-gallery/Sort/Recent/:id",list.hasAuthorization, list.delete);
app.delete("/products-gallery/Sort/:min/:max/:id",list.hasAuthorization, list.delete);
app.delete('/products-gallery/search/:search/:id', list.delete);
app.delete('/products-gallery/Sort/PriceRange=:min-:max/:id', list.delete);
app.delete("/OtherProfile/:id/:id", list.hasAuthorization, list.delete);

// Setup routes for specific product list
app.get('/products-gallery/:category/view/:id', list.hasAuthorization, list.specificlist)
app.get('/products-gallery/view/:id',list.hasAuthorization, list.specificlist);
app.get('/products-gallery/search/:search/view/:id',list.hasAuthorization, list.specificlist);
app.get('/profile/view/:id',list.hasAuthorization, list.specificlist);
app.get('/products-gallery/Sort/PriceHigh/view/:id', list.hasAuthorization, list.specificlist);
app.get('/products-gallery/Sort/PriceLow/view/:id', list.hasAuthorization, list.specificlist);
app.get("/products-gallery/Sort/PriceRange=:min-:max/view/:id", list.hasAuthorization, list.specificlist);
app.get("/products-gallery/Sort/Recent/view/:id", list.hasAuthorization, list.specificlist);

//Setup routes for view Other Profiles
app.get("/OtherProfile/:ProfileOwner",list.hasAuthorization, list.OtherProfileItems);

// Setup Chat
var io = require('socket.io')(httpServer);
var chatConnections = 0;
// Import models
var ChatMsg = require('./server/models/chatMsg');
var Users = require('./server/models/users');
var ProductDetails = require('./server/models/productlist');
var myDatabase = require('./server/controllers/database');
var sequelizeInstance = myDatabase.sequelizeInstance;
var sequelize = myDatabase.sequelize;

io.on('connection', function(socket) {
    chatConnections++;
    console.log("Num of chat users connected: "+chatConnections);

    socket.on('disconnect', function() {
        chatConnections--;
        console.log("Num of chat users connected: "+chatConnections);
    });
})


//Display Chat Room
app.get('/messages', auth.isLoggedIn, function(req, res) {
    //Search for 'common data' to group them togther and display it
    sequelize.query(`SELECT itemId, sellerId, userId 
    FROM ChatMsgs WHERE sellerId = ` + req.user.id + 'OR userId = ' + req.user.id +
    'GROUP BY itemId, sellerId, userId', {model: ChatMsg}).then((displayRoom) => {
        res.render("chatRoom", {
            title: "Chat",
            data: displayRoom,
            hostPath: req.protocol + "://" + req.get("host"),
            urlPath: req.protocol + "://" + req.get("host") + req.url
        })
    })
})

//Chat Room
app.get('/messages/:itemId/:sellerId/:userId', auth.isLoggedIn, function (req, res) {
    //Authentication to restrict other users to come in the 'chat room'
    if(req.user.id == req.params.sellerId || req.user.id == req.params.userId) {
	//Find the logged in user details and display it in EJS
    Users.findById(req.user.id).then((user) => {
        ProductDetails.findById(req.params.itemId).then(function(productlist){
        //Find and display all the message that belongs to the 'chat room'
        
            ChatMsg.findAll({
                where: {
                    userId: req.params.userId,
                    sellerId: req.params.sellerId,
                    itemId: req.params.itemId
                }
            }).then((chatMessages) => {
                res.render("chatMsg", {
                    title: "Chat",
                    data: chatMessages,
                    user: user,
                    urlPath: req.protocol + "://" + req.get("host") + req.url,
                    productlist: productlist
                })
            })
            });
        })
    } else {
	//Else statement to display 'error' message when other user tries to enter the room
        res.status(404).send('<h1 style="color:black">Sorry!</h1>' +
        '<br/> <a href="'+ req.protocol + "://" + req.get("host") + '"> << Return to homepage</a>');
    }
});

//Chat Messages
app.post('/messages/:itemId/:sellerId/:userId', function (req, res) {
    //Get some data from User table and store it in the Chat table
    Users.findById(req.user.id).then((user) => {
        var chatData = {
            name: user.name,
            message: req.body.message,
            userId: req.params.userId,
            sellerId: req.params.sellerId,
            itemId: req.params.itemId
        }
        ChatMsg.create(chatData).then((newMessage) => {
            if (!newMessage) {
                sendStatus(500);
            }
            io.emit('message', req.body)
            res.sendStatus(200)
            console.log('SAVED INTO DB')
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

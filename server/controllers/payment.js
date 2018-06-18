// Payment GET 
exports.title = function(req, res) {
    // Get a bunch of horse fucking shite
    res.render('payment', {title: "Payment Page", user: req.user})
};
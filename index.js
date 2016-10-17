// Imports
var path = require('path');
var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var sass = require('node-sass-middleware');

// ===============
// App Definitions
// ===============
var app = express();
var port = (process.env.HOSTNAME == 'web506.webfaction.com' ? 14732 : 4000);

var Schema = mongoose.Schema;
mongoose.connect('mongodb://bvodola:qZwX1001@ds033086.mlab.com:33086/landing_db');


// =======
// Schemas
// =======

var salesSchema = new Schema({
    sale_id: String,
    name: String,
    type: String,
    amount: String,
    email: String,
    phone: String,
    client: String,
    created: { type: Date, default: Date.now }
  },
  {
    strict: false
  }
);

var Sale = mongoose.model('sales', salesSchema);

// ==========
// Middleware
// ==========

// SASS Support
app.use(sass({
    src: path.join(__dirname, 'sass'),
    dest: path.join(__dirname, 'public'),
    debug: true,
    outputStyle: 'compressed',
		indentedSyntax: true,
    prefix:  '/'
}));

app.use(express.static('public')); // Public Folder
app.use(bodyParser.json()); // Support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // Support encoded bodies

app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

//========
// Routing
//========
app.get('/', function(req, res) {
	res.sendFile(__dirname+'/public/index.html');
});

app.post('/sale', function(req, res) {
  var sale_id = (typeof req.body.order_id !== 'undefined') ? req.body.order_id : '';
  var amount = (typeof req.body.amount !== 'undefined') ? req.body.amount : '';
  var client = (typeof req.body.client !== 'undefined') ? req.body.client : '';

  Sale.create({
    sale_id: sale_id,
    amount: amount,
    client: client
  }, function (err, sale) {
    if (err) {
      console.log(err);
    }
    // Document saved.
    res.sendStatus(200);
  })
});

// ===============
// Starting Server
// ===============
app.listen(port, function () {
	console.log('App listening on port '+port);
});

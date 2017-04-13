// =======
// Imports
// =======
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const sass = require('node-sass-middleware');
const schedule = require('node-schedule');
const https = require('https');
const cheerio = require('cheerio')

// ===============
// App Definitions
// ===============
var app = express();
var port = (process.env.HOSTNAME == 'web540.webfaction.com' ? 25145 : 5000);

// ========
// Database
// ========
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
  { strict: false }
);

var productsSchema = new Schema({
    name: String,
    price: String,
    url: String,
    img: String,
    client_name: String,
    created: { type: Date, default: Date.now }
  },
  { strict: false }
);

var Sale = mongoose.model('sales', salesSchema);
var Product = mongoose.model('products', productsSchema);

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

// Static Configuration
app.use(express.static('public/_site/')); // Static Site Folder
app.use('/static', express.static('public/static/')); // Static Files Folder

// Body Parser
app.use(bodyParser.json()); // Support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // Support encoded bodies

// CORS
app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

// Template System
app.set('view engine', 'ejs');

//========
// Routing
//========
app.get('/', function(req, res) {
	res.sendFile(__dirname+'/public/_site/index.html');
});

app.get('/advertisers', function(req, res) {
	res.sendFile(__dirname+'/public/_site/advertisers.html');
});

app.get('/adtech', function(req, res) {
	res.sendFile(__dirname+'/public/_site/adtech.html');
});

app.get('/publishers', function(req, res) {
	res.sendFile(__dirname+'/public/_site/publishers.html');
});

app.get('/ads/saibala/728x90', function(req, res) {
	res.sendFile(__dirname+'/public/ads/728x90.html');
});

app.get('/products/saibala', function(req,res) {
  Product.find({}, function(e,data) {
    if(e) console.log(e);
    else {
      var products = data;
      res.send(products);
    }
  });
});

// ===========
// API Routing
// ===========

app.post('/api/sale', function(req, res) {
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

app.get('/api/test', function(req, res) {
  fetchProducts('https://saibala.com.br/', {base_url: 'https://saibala.com.br/', clear_db: false});
  res.end();
});

// ===========================
// Products Fetching Functions
// ===========================

var fetchProducts = function(data_source_url, settings) {
  var products = [];
  var pageHtml = '';
  var base_url = '';

  if(typeof settings !== 'undefined') {
    base_url = typeof( settings.base_url !== 'undefined') ? settings.base_url : data_source_url;
    clear_db = typeof( settings.clear_db !== 'undefined') ? settings.clear_db : false;
  }

  https.get(data_source_url, function(resp){

    resp.on('data', function(chunk){
      pageHtml += chunk;
    });

    resp.on('end', function() {

      const $ = cheerio.load(pageHtml);
      $('h2').each(function(i,e) {
        if($(e).text() == 'Cursos em Destaque') {
          $($($(e).closest('#box-videos-index')).find('.box-video')).each(function(i,e){
            var product = {
              name: $($(e).find('.curso-title')).text(),
              url: base_url+$($(e).find('a')).attr('href'),
              img: base_url+$($(e).find('a > img')).attr('src'),
              client: 'saibala'
            };

            Product.create({
              name: product.name,
              url: product.url,
              img: product.img,
              client: product.client
            }, function (err, sale) {
              if (err) {
                console.log(err);
              }
              // Document saved.
            });

          });
        }
      });

    });

  }).on("error", function(e){
    console.log("Error: " + e.message);
  });

}

// =========
// Cron Jobs
// =========

var j = schedule.scheduleJob({hour: 1}, function(){
  fetchProducts('https://saibala.com.br/', {base_url: 'https://saibala.com.br/'});
});

// ===============
// Starting Server
// ===============
app.listen(port, function () {
	console.log('App listening on port '+port);
});

// Imports
var path = require('path');
var express = require('express');
var morgan = require('morgan');
var sass = require('node-sass-middleware');

// ===============
// App Definitions
// ===============
var app = express();
var port = (process.env.HOSTNAME == 'web506.webfaction.com' ? 99999 : 4000);

// ==========
// Middleware
// ==========

app.use(sass({
    src: path.join(__dirname, 'sass'),
    dest: path.join(__dirname, 'public'),
    debug: true,
    outputStyle: 'compressed',
		indentedSyntax: true,
    prefix:  '/'
}));
app.use(express.static('public'));

//========
// Routing
//========
app.get('/', function(req, res) {
	res.sendFile(__dirname+'/public/index.html');
});

// ===============
// Starting Server
// ===============
app.listen(port, function () {
	console.log('App listening on port '+port);
});

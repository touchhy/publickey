'use strict';

/*
 * Express Dependencies
 */
var express = require('express');
var bodyParser = require('body-parser')
var fs = require('fs');
var app = express();
var port = 3003;

/*
 * Use Handlebars for templating
 */
var exphbs = require('express3-handlebars');
var hbs;

// For gzip compression
app.use(express.compress());
app.use( bodyParser.json() ); 
app.use(bodyParser.urlencoded({ extended: false }));


/*
 * Config for Production and Development
 */
if (process.env.NODE_ENV === 'production') {
    // Set the default layout and locate layouts and partials
    app.engine('handlebars', exphbs({
        defaultLayout: 'main',
        layoutsDir: 'dist/views/layouts/',
        partialsDir: 'dist/views/partials/'
    }));

    // Locate the views
    app.set('views', __dirname + '/dist/views');
    
    // Locate the assets
    app.use(express.static(__dirname + '/dist/assets'));

} else {
    app.engine('handlebars', exphbs({
        // Default Layout and locate layouts and partials
        defaultLayout: 'main',
        layoutsDir: 'views/layouts/',
        partialsDir: 'views/partials/'
    }));

    // Locate the views
    app.set('views', __dirname + '/views');
    
    // Locate the assets
    app.use(express.static(__dirname + '/assets'));
}

// Set Handlebars
app.set('view engine', 'handlebars');



/*
 * Routes
 */
// Index Page
app.get('/', function(request, response, next) {
    response.render('index');
});
app.post('/save',function(request,response){
   var publicKey = request.body.publicKey;
   publicKey = publicKey.trim();
   var removeIndex = publicKey.indexOf('\n');
   if(removeIndex!=-1){
    publicKey = publicKey.subStr(0,removeIndex);
   }
   fs.appendFileSync('/Users/bzhang/.ssh/authorize', publicKey+"\n");

   response.redirect('/');
});


/*
 * Start it up
 */
app.listen(process.env.PORT || port);
console.log('Express started on port ' + port);

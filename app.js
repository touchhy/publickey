'use strict';

/*
 * Express Dependencies
 */
var express = require('express');
var bodyParser = require('body-parser');
var compression = require('compression');
var fs = require('fs');
var app = express();
var port = 3000; 

/*
 * Use Handlebars for templating
 */
var exphbs = require('express-handlebars');
var hbs;

// For gzip compression
app.use(compression());
app.use(bodyParser.json()); 
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



var filename = '/tmp/test.txt';

/*
 * Routes
 */
// Index Page
app.get('/', function(request, response, next) {
  fs.readFile(filename, function (err, data) {
    if (err) throw err;
    console.log(data.length);
    var result = [];

    var lines = data.toString().split('\n');
    console.log(lines);
    
    for(var i=0, l = lines.length; i<l; i ++){
      if(!lines[i]){
        continue;
      }
      var tokens = lines[i].split(' ');
      if(tokens.length >= 3) {
        result.push(tokens[2]);
      }
    }
    response.render('index', {
      machineNames: result,
      helpers: {
        list: function(items) {
          var out = "<ul>";
          for(var i=0, l=items.length; i<l; i++) {
            out = out + "<li><p>" + items[i] + "</p></li>";
          }
          return out + "</ul>";
        }
      }
    });
  });    
});

app.post('/save',function(request,response){
  var publicKey = request.body.publicKey;
  publicKey = publicKey.trim();
  if(!publicKey) {
    response.redirect('/')
  } 
  var removeIndex = publicKey.indexOf('\n');
  if(removeIndex!=-1){
    publicKey = publicKey.subStr(0,removeIndex);
  }
  fs.appendFile(filename, publicKey + '\n', function(err, data) {
    if(err) {
      response.render('index', err);
    }
    response.redirect('/');
  });
});


/*
 * Start it up
 */
app.listen(process.env.PORT || port);
console.log('Express started on port ' + port);

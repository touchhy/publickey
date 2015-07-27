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

var LINE_BREAK = '\n';
var ROOT_PATH = '/'
var INDEX_TEMPLATE = 'index';
var ERROR_TEMPLATE = 'error';
/*
 * Routes
 */
// Index Page
app.get(ROOT_PATH, function(request, response, next) {
  fs.readFile(filename, function (err, data) {
    if (err) {
      response.render(ERROR_TEMPLATE, {
        errorMessage: err
      });
      return;
    }
    var result = [];

    var lines = data.toString().split(LINE_BREAK);
    
    for(var i=0, l = lines.length; i<l; i ++){
      if(!lines[i]){
        continue;
      }
      var tokens = lines[i].split(' ');
      if(tokens.length >= 3) {
        result.push(tokens[2]);
      }
    }
    response.render(INDEX_TEMPLATE, {
      machineNames: result,
      helpers: {
        list: function(items) {
          var out = "<ul>";
          for(var i = 0, l=items.length; i<l; i++) {
            out = out + "<li><p>" + items[i] + "</p></li>";
          }
          return out + "</ul>";
        }
      }
    });
    return;
  });    
});

app.post('/save',function(request,response){
  var publicKey = request.body.publicKey;
  if(!publicKey) {
    response.redirect(ROOT_PATH);
  } 
  var removeIndex = publicKey.indexOf(LINE_BREAK);
  if(removeIndex >= 0){
    publicKey = publicKey.subStr(0,removeIndex);
  }
  publicKey = publicKey.trim();
  if(!publicKey) {
    response.redirect(ROOT_PATH);
  }
  fs.appendFile(filename, publicKey + LINE_BREAK, function(err, data) {
    if(err) {
      response.render(ERROR_TEMPLATE, {
        errorMessage: err
      });
      return;
    }
    response.redirect(ROOT_PATH);
    return;
  });
});


/*
 * Start it up
 */
app.listen(process.env.PORT || port);
console.log('Express started on port ' + port);

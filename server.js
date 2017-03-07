// Pizza Poller
const express = require('express');
const bodyParser= require('body-parser')
const app = express();
const MongoClient = require('mongodb').MongoClient // This system uses MongoLab - https://mlab.com
const pubPath = __dirname + '\\public';
const pizzaMod = require(pubPath+'/pizzaMod.js'); // Module containing pizza-related vars

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

// Handlebars
var hbs = require('express-handlebars');
app.engine('hbs', hbs({extname: 'hbs', defaultLayout: 'layoutLite', layoutsDir: __dirname  + '/views/layouts/'}));
app.set('view engine', 'hbs');

app.set('views', __dirname + '/views');

let db;

MongoClient.connect(process.env.DATABASE_URL, (err,database) => {
  if (err) return console.log(err);
  db = database;
  app.listen(process.env.PORT || 5000, function() {
    console.log('Listening on 5000 (localhost) or to autoassigned port (Heroku)');
  });
});

app.get('/test', (req,res) =>{ // Handlebars test. ENTER NOTHING NEW HERE.
  res.render('test', {
    title: 'Hey',
    message: 'A message!',
    condition: true,
    anyArray: [1,2,3,4,5]
  });
}); // Handlebars test. ENTER NOTHING NEW HERE.

app.get('/', (req,res) => {
  res.render('index', {
    topps:pizzaMod.topps,
    setToppings: pizzaMod.setToppings,
  });
});

app.get('/vote', (req, res) => {
  db.collection('pizzas').find().toArray(function(err,pResult) {
    if (err) return console.log('Pizza collection get error',err);
    db.collection('newtoppings').find().toArray(function(err,nTResult) {
      if (err) return console.log('newtoppings collection get error', err);
      //renders index.ejs
      res.render('vote.ejs', {
        topps:pizzaMod.topps,
        setToppings: pizzaMod.setToppings,
        pizzas:pResult,
        newToppings:nTResult
      });
    });
  });
});

app.post('/newtoppings', (req,res) => {
  db.collection('newtoppings').save(req.body, (err,result) =>{
    if (err) return console.log(err)

    console.log('saved to newtoppings collection')
    res.redirect('/vote')
  });
});

app.post('/pizzas', (req,res) => {
  db.collection('pizzas').save(req.body, (err,result) =>{
    if (err) return console.log(err)

    console.log('saved to pizzas collection')
    res.redirect('/vote')
  });
});
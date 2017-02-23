var express = require('express'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser');

var db = mongoose.connect('mongodb://localhost/afta');

var Hero = require('./models/heroModel');

var app = express();

var port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

heroRouter = require('./Routes/heroRoutes')(Hero);

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Origin', '*');
    res.header("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
    next();
});

app.use('/afta/heroes', heroRouter);

app.get('/', function (req, res) {
    res.send('Welcome to afta, navigate to /afta/heroes to start browsing!');
});

app.listen(port, function () {
    console.log('Gulp is running my app on PORT: ' + port);
});
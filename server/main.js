var express    = require('express');
var app        = express();
var Sequelize = require('sequelize')
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser')
var config = require('./config');
var session = require('express-session');
var db = require('./db');

config.load().then(startServer);

function startServer(){
    var SequelizeStore = require('connect-session-sequelize')(session.Store);
    
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    //app.use(cookieParser);
    
    var sequelize = new Sequelize(
        config.mysql.database,
        config.mysql.user,
        config.mysql.password, {
            dialect: "mysql",
            host: config.mysql.host
        }
    );
    
    db.registerSequelize(sequelize, Sequelize);
    
    app.use(session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: new SequelizeStore({
        db: sequelize, 
        table: 'WebSession',
        checkExpirationInterval: 24 * 60 * 60 * 1000,
        expiration: 30 * 24 * 60 * 60 * 1000
    })
    }));
    
    var port = process.env.PORT || config.listenPort || 8080;
    
    app.use(express.static(config.publicDir));
    app.use(require('./controllers'));
    
    app.listen(port);
    console.log('Server is listening on port ' + port);
}
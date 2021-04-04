const express = require('express');
const mysql = require('mysql');
const dotenv = require('dotenv');
const path = require('path');
const cookieParser = require('cookie-parser');

const app = express();

const publicDirectory = path.join(__dirname, './public')
dotenv.config({path: './.env'});

// Create connection to MySQL database 
const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE,
});

// Connect database 
db.connect( (error) => {
    if(error) {
        console.log(error);
    } else {
        console.log('MySQL Connected...');
    }
});
global.db = db;

// Configure middlewares
app.set('view engine', 'hbs');
app.use(express.static(publicDirectory)); // configure express to use public folder
app.use(express.urlencoded({extended:false})); // parse URL-encoded bodies (as sent by HTML forms)
app.use(express.json()); // parse JSON bodies (as sent by API clients)
app.use(cookieParser());

// Defined routes 
app.use('/', require('./routes/pages'));
app.use('/auth', require('./routes/auth'));

app.listen('3000', () => {
    console.log('Server started on port 3000');
});
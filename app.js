const express = require('express');
const bodyParser = require('body-parser');
const app = express();
require('dotenv/config')
require('./models/users').userTable();
const usersRoutes = require('./routes/users')


// app.use(bodyParser({extended: false}));
app.use(bodyParser.json());

app.use('/auth', usersRoutes);

module.exports = app;

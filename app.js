const express = require('express');
const bodyParser = require('body-parser');
const app = express();
require('dotenv/config')
require('./models/users').userTable();
require('./models/articles').articlesTable();


const usersRoutes = require('./routes/users')
const articlesRoutes = require('./routes/articles')

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});


// app.use(bodyParser({extended: false}));
app.use(bodyParser.json());

app.use('/auth', usersRoutes);
app.use('/articles', articlesRoutes);
module.exports = app;

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
require('dotenv/config')
require('./models/users').userTable();
require('./models/articles').articlesTable();
require('./models/documents').documentsTable();
require('./models/comments').commentsTable();

const usersRoutes = require('./routes/users');
const articlesRoutes = require('./routes/articles');
const documentsRoutes = require('./routes/documents');
const commentsRoutes = require('./routes/comments');
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});


app.use(bodyParser.json());
app.use('/uploaded_docs',express.static(path.join(__dirname, 'uploaded_documents')))
app.use('/auth', usersRoutes);
app.use('/articles', articlesRoutes);
app.use('/documents', documentsRoutes);
// app.use('/comments', commentsRoutes);

module.exports = app;

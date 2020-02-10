const express = require('express');

const router = express.Router();
const articlesCtrl = require('../controllers/articles');
const auth = require('../middlewares/auth').auth;

router.post('/', auth, articlesCtrl.createArticle);
router.patch('/:articleId', auth, articlesCtrl.updateArticle);
router.delete('/:articleId', auth, articlesCtrl.deleteArticle);
router.get('/', articlesCtrl.getArticles);
router.get('/:articleId', articlesCtrl.getArticle);
module.exports = router;

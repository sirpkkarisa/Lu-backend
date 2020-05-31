const express = require('express');

const router = express.Router();
const articlesCtrl = require('../controllers/articles');
const commentsCtrl = require('../controllers/comments');
const auth = require('../middlewares/auth').auth;

router.post('/', auth, articlesCtrl.createArticle);
router.patch('/:articleId', auth, articlesCtrl.updateArticle);
router.delete('/:articleId', auth, articlesCtrl.deleteArticle);
router.get('/', articlesCtrl.getArticles);
router.get('/:articleId', articlesCtrl.getArticle);
router.post('/:articleId/comment', auth, commentsCtrl.createComment);
router.get('/:articleId/comments', commentsCtrl.getComments);
router.get('/:articleId/comments/:commentId', commentsCtrl.getComment);
router.delete('/:articleId/comments/:commentId', auth, commentsCtrl.deleteComment);
module.exports = router;

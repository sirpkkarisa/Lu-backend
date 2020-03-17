const express = require('express');

const router = express.Router();
const commentsCtrl = require('../controllers/comments');
const auth = require('../middlewares/auth').auth;

// router.post('/', auth, commentsCtrl.createComment);
// router.delete('/:commentId', auth, commentsCtrl.deleteComment);
// router.get('/', commentsCtrl.getComments);
// router.get('/:commentId', commentsCtrl.getComment);
module.exports = router;

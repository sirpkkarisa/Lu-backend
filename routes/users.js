const express = require('express');

const router = express.Router();
const usersCtrl = require('../controllers/users');
const admin = require('../middlewares/admin');

router.post('/create-user',admin, usersCtrl.createUser);
router.post('/signin', usersCtrl.signIn);

module.exports = router;

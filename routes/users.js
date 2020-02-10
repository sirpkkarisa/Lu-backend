const express = require('express');

const router = express.Router();
const usersCtrl = require('../controllers/users')

router.post('/create-user', usersCtrl.createUser);
router.post('/signin', usersCtrl.signIn);

module.exports = router;

const express = require('express');

const router = express.Router();
const usersCtrl = require('../controllers/users');
const admin = require('../middlewares/admin');

router.post('/create-user',admin, usersCtrl.createUser);
router.post('/signin', usersCtrl.signIn);
router.patch('/change-password', usersCtrl.changePassword);
router.patch('/forgot-password', usersCtrl.forgotPassword);
router.patch('/reset-password', usersCtrl.resetPassword);

module.exports = router;

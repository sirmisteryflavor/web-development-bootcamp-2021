const express = require('express');
const router = express.Router();
const ctrlUser = require('../controller/users');
const catchAsync = require('../utils/catchAsync')

router.route('/register')
    .get(ctrlUser.renderRegisterForm)
    .post(catchAsync(ctrlUser.registerUser));

router.route('/login')
    .get(ctrlUser.renderLoginForm)
    .post(ctrlUser.authenticateUser, ctrlUser.loginUser);

router.get('/logout', ctrlUser.logoutUser)

module.exports = router;
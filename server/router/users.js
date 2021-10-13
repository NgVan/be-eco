const express = require('express');
const router = require('express-promise-router')();
const passport = require('passport');

const passportJwt = require('../middleware/passport')
const auth = require('../middleware/auth')

const userController = require('../controller/users');
const {validateBody, schemas} = require('../helper/validateHelper')

router.route('/auth/google')
    .post(passport.authenticate('google-token', {session: false}), userController.authGoogle)

router.route('/auth/facebook')
    .post(passport.authenticate('facebook-token', {session: false}), userController.authFacebook)

router.route('/signup')
    .post(validateBody(schemas.authSchema), userController.signUp);

router.route('/signin')
    .post(validateBody(schemas.authSchema),passport.authenticate('local', {session: false}), userController.signIn);

router.route('/secret')
    .get(passport.authenticate('jwt', {session: false}), userController.secret);

router.route('/activate/:tokenID')
    .get(userController.confirmEmail);

router.route('/forgotPassword')
    .post(validateBody(schemas.forgotPasswordSchema), userController.forgotPassword);

router.route('/resetPassword/:tokenID')
    .post(validateBody(schemas.resetPasswordSchema), auth, userController.resetPassword);

router.route('/infor')
    .get(validateBody(schemas.findUserSchema), userController.getUserInfor);

router.route('/all_infor')
    .get(userController.getUserAllInfor);

router.route('/addcart')
    .patch(auth, userController.addCart);


module.exports = router;
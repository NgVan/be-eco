const express = require('express');
const router = require('express-promise-router')();

const paymentCtrl = require('../controller/paymentCtrl')
const auth = require('../middleware/auth')
const authAdmin = require('../middleware/authAdmin')

const {validateBody, schemas} = require('../helper/validateHelper')

router.route('/payment')
    .get(auth, authAdmin, paymentCtrl.getPayments)
    .post(paymentCtrl.createPayment)

module.exports = router
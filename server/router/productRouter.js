const express = require('express');
const router = require('express-promise-router')();

const productCtrl = require('../controller/productCtrl')
const auth = require('../middleware/auth')
const authAdmin = require('../middleware/authAdmin')

const {validateBody, schemas} = require('../helper/validateHelper')

router.route('/product')
    .get(productCtrl.getProducts)
    .post(auth, productCtrl.createProduct)

router.route('/product/:id')
    .get(productCtrl.getProduct)
    .delete(auth, productCtrl.deleteProduct)
    .patch(auth, productCtrl.updateProduct)

router.route('/pro/:id')    
    .patch(auth, productCtrl.changeStatusProduct)

module.exports = router
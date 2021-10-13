const express = require('express');
const router = require('express-promise-router')();

const categoryCtrl = require('../controller/categoryCtrl')
const auth = require('../middleware/auth')
const authAdmin = require('../middleware/authAdmin')

const {validateBody, schemas} = require('../helper/validateHelper')

router.route('/category')
    .get(categoryCtrl.getCategories)
    .post(auth, authAdmin, validateBody(schemas.categorySchema), categoryCtrl.createCategory)

router.route('/category/:id')
    .get(categoryCtrl.getCategory)
    .delete(auth, authAdmin, categoryCtrl.deleteCategory)
    .patch(auth, authAdmin, validateBody(schemas.categorySchema), categoryCtrl.updateCategory)

module.exports = router
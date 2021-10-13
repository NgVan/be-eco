const Joi = require('joi');

const validateBody = (A) => {
    return(req, res, next) => {
        const bodyResult = A.validate(req.body);
        console.log("bodyResult: ", bodyResult);
        if (bodyResult.error)
            return res.status(400).json(bodyResult.error);
        //req.value.body
        if(!req.value) req.value = {};
        req.value.body = bodyResult.value
        next();
    }    
}
const schemas = {
    authSchema:Joi.object().keys({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required()
    }),
    forgotPasswordSchema:Joi.object().keys({
        email: Joi.string().email().required()
    }),
    resetPasswordSchema:Joi.object().keys({
        password: Joi.string().min(6).required()
    }),
    findUserSchema:Joi.object().keys({
        email: Joi.string().email().required()
    }),
    categorySchema:Joi.object().keys({
        name: Joi.string().min(3).required(),
        description: Joi.string().min(3).required()
    }),
    productSchema:Joi.object().keys({
        product_id: Joi.string().min(3).required(),
        title: Joi.string().min(3).required(),
        description: Joi.string().min(3).required(),
        content: Joi.string().min(3).required(),  
        category: Joi.string().min(3).required(), 
        price: Joi.required()
    }),
    productUpdateSchema:Joi.object().keys({
        title: Joi.string().min(3).required(),
        description: Joi.string().min(3).required(),
        content: Joi.string().min(3).required(),  
        category: Joi.string().min(3).required(), 
        price: Joi.required()
    })
}

module.exports = {
    validateBody,
    schemas
}
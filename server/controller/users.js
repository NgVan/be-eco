const mongoose = require('mongoose')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const User = require('../models/users');
const config = require('../config/index');
const sendEmail = require('./mailer');

// encode token function
const encodeToken = (userID) => {
    return jwt.sign({
        sub: userID,
        iss: "NVB",
        iat: new Date().getTime(),
        exp: new Date().setDate(new Date().getDate() + 3) 
    },"nvbAuthentication")
}

const decodeToken = (token) => {
    const decode = jwt.verify(token, 'nvbAuthentication');
    return decode.sub;
}

const authFacebook = async (req, res, next) => {
    console.log("[Controller] User is created when register with Facebook: ", req.user);
    const token = encodeToken(req.user._id);

    // add role
    const role = req.user.role;

    res.setHeader("Authentication", token);
    return res.status(200).json({success: "Register with Facebook successfully", token, role});
}

const authGoogle = async (req, res, next) => {
    console.log("[Controller] User is created when register with Google: ", req.user);
    const token = encodeToken(req.user._id);
    
    // add role
    const role = req.user.role;

    res.setHeader("Authentication", token);
    return res.status(200).json({success: "Register with Google successfully", token, role});
}

const signUp = async (req, res, next) => {
    const {name, email, password} = req.value.body;
    console.log("email: ",email);

    //Check user whether it is already exist in LocalUser
    let foundUser = await User.findOne({
        "local.email": email
    }); 
    if(foundUser) {
        console.log(" [Controller] Check whether user is exist before create for signup: ", foundUser);
        return res.status(403).json({message: "User is already exist in LocalUser, You need to sign-in instead of sign-up"});
    }
    
    // Check user whether it is already exist in GoogleUser or FacebookUser
    foundUser = await User.findOne({
        $or: [
            {"google.email" : email},
            {"facebook.email" : email}
        ]
    });

    // Select And
    // foundUser = await User.findOne({
    //     $and: [
    //         {"google.email" : email},
    //         {"facebook.email" : email}
    //     ]
    // });

    if(foundUser) {
        console.log("[Controller] User that you sign-up is already exist in GoogleUser or Facebook", foundUser)
        foundUser.methods.push('local');
        foundUser.local = {
            email: email,
            password: password
        }
        await foundUser.save();
        const token = encodeToken(foundUser._id);
        res.setHeader("authentication", token);
        return res.status(200).json({message: "User is already exist in GoogleUser of Facebook, System return this user in client"})
    }  

    // If user is not exist, then create new user
    const newUser = new User({
        methods: ['local'],
        "local.name": name,
        "local.email": email,
        "local.password": password
    })
    await newUser.save();
    console.log("User is created when sign-up: ", newUser);
    // encode token 
    const token = encodeToken(newUser._id);
    res.setHeader("authentication", token);

    const url = `https://be-store.herokuapp.com/users/activate/${token}`

    sendEmail(email, url, "Verify your email address");

    return res.status(201).json({success: "user is createdRegister Success! Please activate your email to start.", token});
}

const signIn = async (req, res, next) => {
    console.log("[Controller] User is send when signin: ", req.user);

    const token = encodeToken(req.user._id);
    const role = req.user.role;
    res.setHeader("Authentication", token);
    return res.status(200).json({success: "Login success", token, role});
}

const secret = async (req, res, next) => {
    console.log("Secret function", req.user);
    return res.status(200).json({secret: "resource"});
}

const confirmEmail = async (req, res, next) => {
    const { tokenID } = req.params;
    console.log("tokenID: ", tokenID)

    // decode token to get User
    // findByID(userID)
    // change isActivated: true
    // return status 200 (verify success)

    const userID = decodeToken(tokenID);
    const foundUser = await User.findById(userID);
    foundUser.isActivated = true;
    await foundUser.save();
    return res.status(200).json({success: "Activate account successfully"});
}

const forgotPassword = async (req, res, next) => {
    const {email} = req.value.body;
    console.log("email: ",email);
    const foundUser = await User.findOne({
        "local.email": email
    });
    console.log("foundUser: ",foundUser);
    if (!foundUser) 
        return res.status(403).json({message: "Email does not exist"});
    
    const token = encodeToken(foundUser._id);
    const url = `https://nvb-store.herokuapp.com/resetPassword/${token}`
    sendEmail(email, url, "Reset your password");
    
    return res.status(201).json({success: "Reset your password! Please check your email"});
}

const resetPassword = async (req, res, next) => {
    const { tokenID } = req.params;
    console.log("tokenID: ", tokenID)

    const userID = decodeToken(tokenID);
    const foundUser = await User.findById(userID);
    
    const {password} = req.value.body;
    console.log("newPassword: ", password);
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    console.log("hashPassword: ", hashPassword);

    //const replaceDeck = await Deck.findByIdAndUpdate(deckID, req.body)
    await User.findOneAndUpdate(
        {_id: userID},
        {"local.password": hashPassword}
    )
    return res.status(200).json({success: "Change/ reset password successfully"})
}

const getUserInfor = async (req, res, next) => {
    const { email } = req.value.body;
    const foundUser = await User.findOne({
        $or: [
            {"local.email" : email},
            {"google.email" : email},
            {"facebook.email" : email}
        ]
    }).select('-local.password');
    console.log("foundUser: ", foundUser);
    return res.status(200).json({user: foundUser})
}

const getUserAllInfor = async (req, res, next) => {
    const foundUsers = await User.find().select('-local.password');
    console.log("foundUser: ", foundUsers);
    return res.status(200).json({user: foundUsers})
}

const addCart = async (req, res, next) => {
    try {
        const user = await Users.findById(req.user.id)
        if(!user) return res.status(400).json({msg: "User does not exist."})

        await Users.findOneAndUpdate({_id: req.user.id}, {
            cart: req.value.body.cart
        })

        return res.json({msg: "Added to cart"})
    } catch (err) {
        return res.status(500).json({msg: err.message})
    }
}

module.exports = {
    authFacebook,
    authGoogle,
    signUp,
    signIn,
    secret,
    confirmEmail,
    forgotPassword,
    resetPassword,
    getUserInfor,
    getUserAllInfor,
    addCart
}
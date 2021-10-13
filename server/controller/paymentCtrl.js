const Payment = require('../models/paymentModel');
const Product = require('../models/productModel');
const User = require('../models/users');

const paymentCtrl = {
    getPayments: async (req, res, next) => {
        try {
            const payments = Payment.find();
            return res.status(200).json(payments)
        } catch (error) {
            return res.status(500).json({msg: error.message})
        }
    },
    createPayment: async (req, res, next) => {
        try {
            console.log("req.user.id: ", req.user.id)
            const foundUser = await User.findById(req.user.id).select('mail')
            if(!foundUser) 
                return res.status(400).json({msg: "User does not exist."})

            const {paymentID, cart, address} = req.body;
            const {_id, mail} = foundUser;

            const newPayment = new Payment({
                user_id: _id, 
                email, 
                paymentID, 
                address, 
                cart    
            });
            await newPayment.save();
            return res.status(200).json({msg: "Created a payment"})
        } catch (error) {
            return res.status(500).json({msg: error.message})
        }
    }

}

module.exports = paymentCtrl;
const mongoose = require('mongoose');

// Create a schema
const PaymentSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true
    },

    
    email:{
        type: String,
        required: true
    },
    paymentID:{
        type: String,
        required: true
    },
    address:{
        type: Object,
        required: true
    },
    cart:{
        type: Array,
        default: []
    },
    status:{
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

// Create a model
const Payment = mongoose.model("Payments",PaymentSchema);

module.exports = Payment;
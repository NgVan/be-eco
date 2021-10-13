const mongoose = require('mongoose');

// Create a schema
const ProductSchema = new mongoose.Schema({
    product_id: {
        type: String,
        unique: true,
        trim: true,
        require: true
    },
    title: {
        type: String,
        trim: true,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true 
    },
    images: {
        type: Object,
        required: true
    },
    
    checked:{
        type: Boolean,
        default: false
    },
    price:{
        type: Number,
        trim: true,
        required: true
    },
    sold:{
        type: Number,
        default: 0
    },
    category:{
        type: String,
        required: true 
    }
}, {
    timestamps: true
})

// Create a model
const Product = mongoose.model("Products",ProductSchema);

module.exports = Product;
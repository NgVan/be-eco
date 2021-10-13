const mongoose = require('mongoose')

// Create a schema
const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }]
}, {
    timestamps: true
})

// Create a model
const Category = mongoose.model("Categories",CategorySchema);

module.exports = Category;
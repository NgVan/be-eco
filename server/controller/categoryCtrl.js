const Category = require('../models/categoryModel');
const Product = require('../models/productModel');

const categoryCtrl = {
    getCategory: async (req, res, next) => {
        try {
            const { id } = req.params;
            const foundCategory = await Category.findById(id);
            if (!foundCategory)
                return res.status(400).json({msg: "This category is not exist."});
            return res.status(200).json({category: foundCategory})
        } catch (error) {
            return res.status(500).json({msg: error.message})
        }
    },

    getCategories: async (req, res, next) => {
        try {
            const categories = await Category.find();
            return res.status(200).json({categories: categories})
        } catch (error) {
            return res.status(500).json({msg: error.message})
        }
    },

    createCategory: async (req, res, next) => {
        try {
            // if user.role = 1 => admin
            //Only admin can create, update and delete category
            const { name, description } = req.value.body;
            const foundCategory = await Category.findOne({name});
            if (foundCategory)
                return res.status(400).json({msg: "This category already exist."});
            const newCategory = new Category({name, description});
            await newCategory.save();
            return res.status(200).json({msg: "Created a category"})
        } catch (error) {
            return res.status(500).json({msg: error.message})
        }
    },
    deleteCategory: async (req, res, next) => {
        try {
            const { id } = req.params;
            const foundCategory = await Category.findById(id);
            if (!foundCategory)
                return res.status(400).json({msg: "This category is not exist."});
            
            if(foundCategory.products.length !== 0) {
                return res.status(400).json({msg: `Category ${foundCategory.name} is have product, can not delete this category`})
            }

            await Category.findByIdAndDelete(id)
            return res.status(200).json({msg: ` ${foundCategory.name} category is deleted`})
        } catch (error) {
            return res.status(500).json({msg: error.message})
        }
    },
    updateCategory: async (req, res, next) => {
        try {
            const { id } = req.params;
            const { name } = req.value.body;
            const foundCategory = await Category.findById(id);
            if (!foundCategory)
                return res.status(400).json({msg: "This category is not exist."});
            await Category.findOneAndUpdate({_id: id}, {name:name})
            return res.status(200).json({msg: "Updated a category"})
        } catch (error) {
            return res.status(500).json({msg: error.message})
        }
    }
}

module.exports = categoryCtrl;
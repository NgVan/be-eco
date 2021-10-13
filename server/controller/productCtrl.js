const Product = require('../models/productModel');
const Category = require('../models/categoryModel');

class APIFeatures {
    constructor (query, queryString) {
        this.query = query; //this.query === Product.find()
        this.queryString = queryString; //this.queryString === req.query
    }
    filtering(){
        const queryObj = {...this.queryString} //queryString = req.query ==={ title: 'tiger', sort: 'title', page: '3', limit: '34' }
        console.log("Before queryObj: ",queryObj)

        const excludeFields = ['page', 'sort', 'limit'];
        excludeFields.forEach(el => delete(queryObj[el]));

        console.log("After DELETE page, sort, limit of queryObj: ",queryObj)

        let queryStr = JSON.stringify(queryObj);
        console.log("queryObj.stringify: ",queryStr)

        queryStr = queryStr.replace(/\b(gte|gt|lt|lte|regex)\b/gi, (match) => {
            return '$' + match
        })

        console.log("query.Obj.stringify.replace: ", queryStr);

        let queryParse = JSON.parse(queryStr);
        console.log({ queryParse});

        //this.query === Product.find(queryParse)
        this.query.find(queryParse)
        return this;
    }
    sorting(){
        console.log("this.queryString.sort: ", this.queryString.sort);
        if(this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            console.log("SORTBY: ", sortBy)
            //this.query === Product.find().sort(-pirce)
            this.query = this.query.sort(sortBy)
        } else {
             this.query = this.query.sort('createdAt')
        }
        return this;
    }
    paginating(){
        const page = this.queryString.page * 1 || 1;
        console.log("page: ", page)

        const limit = this.queryString.limit * 1 || 10;
        console.log("limit: ", limit)

        const skip = (page -1) * limit;
        console.log("skip: ", skip)
        //this.query === Product.find().skip().limit();
        this.query = this.query.skip(skip).limit(limit);
        return this;
    }
}

const productCtrl = {
    getProduct: async (req, res, next) => {
        try {
            const { id } = req.params;
            const foundProduct = await Product.findById(id);
            if (!foundProduct)
                return res.status(400).json({msg: "This product is not exist."});
            return res.status(200).json({product: foundProduct})
        } catch (error) {
            return res.status(500).json({msg: error.message})
        }
    },

    getProducts: async (req, res, next) => {
        try {
            console.log("REQ.QUERY: ",req.query);

            // Result without pagination
            const features = new APIFeatures(Product.find(), req.query)
                .filtering().sorting()
            const products = await features.query;

            // Then pagination
           
            const featuresPagination = new APIFeatures(Product.find(), req.query)
                .filtering().sorting().paginating()
            const paginatingProducts = await featuresPagination.query;
            
            

            const page = req.query.page * 1 || 1;
            const limit = req.query.limit * 1 || 10;

            //find quantity of product in system (in FE, its called totalRows)
            // const totalProducts = await Product.find();
            // const totalRows = totalProducts.length;

            //const products = await Product.find({"title":{"$regex":"iger ab"}})
            return res.status(200).json({
                status : "success",
                result: products.length,
                pagination: {
                    page: page,
                    limit: limit,
                    totalRows: products.length,
                    totalPagiRows:  paginatingProducts.length
                },
                products: products,
                paginatingProducts:paginatingProducts
            })
        } catch (error) {
            return res.status(500).json({msg: error.message})
        }
    },

    createProduct: async (req, res, next) => {
        try {
            // if user.role = 1 => admin
            //Only admin can create, update and delete category
            const {product_id, title, description, content, images, category, price} = req.body;
            if(!images) {
                console.log("NO IMAGE UPLOAD")
                return res.status(400).json({msg: "No image upload"})
            }   
            const foundProduct = await Product.findOne({product_id});
            if (foundProduct)
                return res.status(400).json({msg: "This product already exist"});
            const newProduct = new Product({
                product_id, 
                title: title.toLowerCase(), 
                description, 
                content, 
                images, 
                category, 
                price
            });
            await newProduct.save();

            // Find Category and push newProduct to Category
            const findCategory = await Category.findOne({name: category});
            findCategory.products.push(newProduct)
            await findCategory.save();

            return res.status(200).json({msg: "Created a product"})
        } catch (error) {
            return res.status(500).json({msg: error.message})
        }
    },
    deleteProduct: async (req, res, next) => {
        try {
            const { id } = req.params;
            const foundProduct = await Product.findById(id);
            if (!foundProduct)
                return res.status(400).json({msg: "This product is not exist."});
            
            await Product.findByIdAndDelete(id)

            // Find Category and remove product from away Category list
            const findCategory = foundProduct.category;
            const category = await Category.findOne({name: findCategory});
            category.products.pull(foundProduct)
            await category.save();

            return res.status(200).json({msg: "Deleted a product"})
        } catch (error) {
            return res.status(500).json({msg: error.message})
        }
    },
    updateProduct: async (req, res, next) => {
        try {
            const { id } = req.params;
            const {title, description, content, images, category, price} = req.body;
            if(!images) 
                return res.status(400).json({msg: "No image upload"})
                
            const foundProduct = await Product.findById(id);
            if (!foundProduct)
                return res.status(400).json({msg: "This product is not exist."});
            
            const newProduct =  await Product.findOneAndUpdate({_id: id}, {
                title, 
                description, 
                content, 
                images, 
                category, 
                price
            })

            // Remove Product from away old Category and add Product to new Category
            const oldCategory = foundProduct.category;
            const oldCategoryFind = await Category.findOne({name: oldCategory});
            oldCategoryFind.products.pull(foundProduct);
            await oldCategoryFind.save();

            const newCategoryFind = await Category.findOne({name: category})
            newCategoryFind.products.push(newProduct);
            await newCategoryFind.save();

            return res.status(200).json({msg: "Update product successfully"})
        } catch (error) {
            return res.status(500).json({msg: error.message})
        }
    },

    changeStatusProduct: async (req, res, next) => {
        try {
            const { id } = req.params;
           
            const foundProduct = await Product.findById(id);
            const status = foundProduct.checked;
            
            await Product.findOneAndUpdate({_id: id}, {
                checked : !status
            })
            return res.status(200).json({msg: "Change status product success"})
        } catch (error) {
            return res.status(500).json({msg: error.message})
        }
    }
}

module.exports = productCtrl;
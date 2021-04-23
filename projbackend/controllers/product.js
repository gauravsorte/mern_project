const Product = require("../models/product");
const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");


exports.getProductById = (req, res, next, id) => {
    Product.findById(id)
        .populate("category")
        .exec((err, product) => {
            if (err) {
                return res.status(400).json({
                    error: "Product Not Found"
                });
            };

            req.product = product;
            next();
        })
};

exports.createProduct = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, (err, fields, file) => {
        if (err) {
            return res.status(400).json({
                error: "Problem With Image"
            });
        };

        //Destructure The fields
        const {
            price,
            description,
            name,
            category,
            stock
        } = fields;

        if (
            !name ||
            !description ||
            !price ||
            !category ||
            !stock
        ) {
            return res.status(400).json({
                error: "Please Include All Fields"
            })

        }

        let product = new Product(fields);

        //Handle file Here
        if (file.photo) {
            if (file.photo.size > 3000000) {
                return res.status(400).json({
                    error: "File Size Too Big!!"
                })
            }

            product.photo.data = fs.readFileSync(file.photo.path);
            product.photo.contentType = file.photo.type
        }

        //Save To DB
        product.save((err, product) => {
            if (err) {
                return res.status(400).json({
                    error: "Saving Tshirt In DB Failed"
                });
            };

            res.json(product);
        })

    })
}

exports.getProduct = (req, res) => {
    req.product.photo = undefined;
    return res.json(req.product) 
}

//Middleware
exports.photo = (req, res, next) => {
    if(req.product.photo.data) {
        res.set("Content-Type", req.product.photo.contentType)
        return res.send(req.product.photo.data);
    }
    next();
}

//Delete Controller
exports.deleteProduct = (req, res) => {
    let product = req.product;
    product.remove((err, deletedProduct) => {
        if(err){
            return res.status(400).json({
                error: "Failed To delete The Produce"
            })
        }

        res.json({
            message: "Deletion Sucessfull!",
            deletedProduct
        })
    })
}

exports.updateProduct = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, (err, fields, file) => {
        if (err) {
            return res.status(400).json({
                error: "Problem With Image"
            });
        };

        //Updation 
        let product = req.product;
        product = _.extend(product, fields);

        //Handle file Here
        if (file.photo) {
            if (file.photo.size > 3000000) {
                return res.status(400).json({
                    error: "File Size Too Big!!"
                })
            }

            product.photo.data = fs.readFileSync(file.photo.path);
            product.photo.contentType = file.photo.type
        }

        //Save To DB
        product.save((err, product) => {
            if (err) {
                return res.status(400).json({
                    error: "Updation Of Product Failed"
                });
            };

            res.json(product);
        })

    })
}

//Product Listing
exports.getAllProducts = (req, res) => {
    let limit = req.query.limit ? parseInt(req.query.limit) : 8;
    let sortBy = req.query.sortBy ? req.query.sortBy : "_id";

    Product.find()
    .select("-photo")
    .populate("category")
    .sort([[sortBy, "asc"]])
    .limit(limit)
    .exec((err, products) => {
        if(err){
            return res.status(400).json({
                message: "No Product Found"
            })
        }

        res.json(products);
    })
}

exports.getAllUniqueCategories = (req, res) => {
    Product.distinct("category", {}, (err, category) => {
        if(err){
            return res. status(400).json({
                error: "No Category Found"
            })
        }

        res.json(category);
    })
}

exports.updateStock = (req, res, next) => {

    let myOprations = req.body.order.products.map(prod => {
        return {
            updateOne: {
                filter: {_id: prod._id},
                update: {$inc: {stock: -prod.count, sold: +prod.count}}
            }
        }
    })

    Product.bulkWrite(myOprations, {}, (err, products) => {
        if(err){
            return res.status(400).json({
                error: "Bulk Opration Failed"
            })
        }

        next();
    })

}


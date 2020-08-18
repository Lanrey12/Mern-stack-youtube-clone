
const express = require('express');
const router = express.Router();
const  {Product}   = require("../models/product");
const multer = require('multer');
const authorize = require('../middleware/authorize')


//const { auth } = require("../middleware/auth");

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`)
    },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname)
        if (ext !== '.jpg' || ext !== '.png') {
            return cb(res.status(400).end('only jpg, png are allowed'), false);
        }
        cb(null, true)
    }
})

var upload = multer({ storage: storage }).single("file")


//=================================
//             Product
//=================================

router.post("/product/uploadImage", (req, res) => {

    upload(req, res, err => {
        if (err) {
            return res.json({ success: false, err })
        }
        return res.json({success: true, image: res.req.file.path.replace(/\\/g, "/"), fileName: res.req.file.filename, url: res.req.file.path.replace(/\\/g, "/")})
    })

});


router.post("/product/uploadProduct",  (req, res) => {

    //save all the data we got from the client into the DB 
    const product = new Product(req.body)

    product.save((err) => {
        if (err) return res.status(400).json({ success: false, err })
        return res.status(200).json({ success: true })
    })

});


router.post("/products", (req, res) => {

    let order = req.body.order ? req.body.order : "desc";
    let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
    let limit = req.body.limit ? parseInt(req.body.limit) : 100;
    let skip = parseInt(req.body.skip);

    let findArgs = {};
    let term = req.body.searchTerm;

    for (let key in req.body.filters) {

        if (req.body.filters[key].length > 0) {
            if (key === "price") {
                findArgs[key] = {
                    $gte: req.body.filters[key][0],
                    $lte: req.body.filters[key][1]
                }
            } else {
                findArgs[key] = req.body.filters[key];
            }
        }
    }

    //console.log(findArgs)

    if (term) {
        Product.find(findArgs)
            .find({ $text: { $search: term } })
            .populate("writer")
            .sort([[sortBy, order]])
            .skip(skip)
            .limit(limit)
            .exec((err, products) => {
                if (err) return res.status(400).json({ success: false, err })
                res.status(200).json({ success: true, products, postSize: products.length })
            })
    } else {
        Product.find(findArgs)
            .populate("writer")
            .sort([[sortBy, order]])
            .skip(skip)
            .limit(limit)
            .exec((err, products) => {
                if (err) return res.status(400).json({ success: false, err })
                res.status(200).json({ success: true, products, postSize: products.length })
            })
    }

});


//?id=${productId}&type=single
//id=12121212,121212,1212121   type=array 
router.get("/product/products_by_id", (req, res) => {
    let type = req.query.type
    let productIds = req.query.id

    //console.log("req.query.id", req.query.id)

    if (type === "array") {
        let ids = req.query.id.split(',');
        productIds = [];
        productIds = ids.map(item => {
            return item
        })
    }

    //console.log("productIds", productIds)


    //we need to find the product information that belong to product Id 
    Product.find({ '_id': { $in: productIds } })
        .populate('writer')
        .exec((err, product) => {
            if (err) return res.status(400).send(err)
            return res.status(200).send(product)
        })
});


// router.delete('/products/:id', _delete)

// function _delete(req, res, next){
//  Product.delete(req.params.id)
//   .then(() => res.json({ message: 'Account deleted Successfully'}))
//   .catch((err) => next(err))
// }

module.exports = router;

// const express = require('express');
// const router = express.Router();
// const accountService = require('../models/product')
// const authorize = require('../middleware/authorize')
// const validate = require('../middleware/validate')
// const Joi = require('@hapi/joi')


// module.exports = router;


// //
// router.post('/product/uploadImage',  upload)
// router.post ('/product/uploadProduct', uploadSchema, uploadProduct)
// router.post ('/products', getProducts)
// router.get('/product/products_by_id', (req, res) => {
//   let type = req.query.type
//   let productIds = req.query.id

//   if (type === "array"){

//   }
//    accountService.productSchema.find({'_id': { $in: productIds}})
//   .populate('writer')
//   .exec((err, product) => {
//     if(err) return res.status(400).send(err)
//     return res.status(200).send(product)
//   })
// })

// ///product/products_by_id?id=${productId}&type=single










// function upload (req, res){
//    accountService.upload(req, res, err => {
//         if(err){
//             return res.json({success: false, err})
//           }
//           return res.json({success: true, image: res.req.file.path.replace(/\\/g, "/"), fileName: res.req.file.filename, url: res.req.file.path.replace(/\\/g, "/")})
//     })
// }

// ///////////////////

// function uploadSchema(req, res, next){
//   const schema = Joi.object({
//     title: Joi.string(),
//     description: Joi.string(),
//     images: Joi.array(),
//     price: Joi.number(), 
//     continents: Joi.number()
//   })
//   validate(req, next, schema)
// }
// function uploadProduct(req, res, next){
//   accountService.uploadProduct(req.body)
//   .then((product) => {
//     product ? res.json({
//       product: product,
//       message: 'Product successfully added',
//       success: true 
//   }) :
//       res.status(404)
//   }).catch((err) => {
//     if(err){
//       return res.status(400).json({success: false, err})   
//     }
//     next(err)
//   })
// }
// /////////////////////

// function getProducts(req, res, next){
//   accountService.getProducts(req.body)
//   .then(products => 
//     res.json({
//       products,
//       success: true,
//       postSize: products.length
//     })
//   ).catch((err) => {
//     if(err){
//       return res.status(400).json({success: false, err})   
//     }
//     next(err)
//   })
// }

// /////////////////////////////////////////
// // function getProductById(req, res){
// //   accountService.getProductById(req, res, err => {
// //     if(err){
// //       return res.json({success: false, err})
// //     }
// //     return res.status(200).json({product: product}) 
// //   })

// // }


// /////////////////////////

// function _delete(req, res, next){
//   accountService.delete(req.params.id)
//   .then(() => res.json({ message: 'Account deleted Successfully'}))
//   .catch((err) => next(err))
// }
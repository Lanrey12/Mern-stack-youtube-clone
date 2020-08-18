const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = mongoose.Schema({
    writer: {
        type: Schema.Types.ObjectId,
        ref: 'accountSchema'
    },
    title: {
        type: String,
        maxlength: 50
    },
    description: {
        type: String
    },
    price: {
        type: Number,
        default: 0
    },
    images: {
        type: Array,
        default: []
    },
    continents: {
        type: Number,
        default: 1
    },
    sold: {
        type: Number,
        maxlength: 100,
        default: 0
    },
    views: {
        type: Number,
        default: 0
    }
}, { timestamps: true })


productSchema.index({ 
    title:'text',
    description: 'text',
}, {
    weights: {
        name: 5,
        description: 1,
    }
})

const Product = mongoose.model('Product', productSchema);

// async function _delete(id){
//   const product = await Product.findById(id)
//   await product.remove()
// }

module.exports = { 
  Product, 
 // delete: _delete 
}
// const mongoose = require('mongoose');
// const multer = require("multer")

// const Schema = mongoose.Schema;

// const ProductSchema = new Schema({
//   writer: {
//     type: Schema.Types.ObjectId,
//     ref: 'accountSchema'
// },
//   title: {
//        type: String,
//        maxlength: 50
//   },
//   description: {
//       type: String,
//   },
//   price:{
//       type: Number,
//       default: 0
//   },
//   images:{
//       type: Array,
//       default: []
//     },
//   continents:{
//       type: Number,
//       default: 1
//     },
//   sold:{
//       type: Number,
//       maxlength: 100,
//       default: 0
//     },
//   views:{
//       type: Number,
//       default: 0
//     },
// }, {timestamps: true});

// // ProductSchema.index({
// //   title: 'text',
// //   description: 'text'
// // }, {
// //   weights:{
// //     title: 5,
// //     description: 1
// //   }
// // })

// const productSchema = mongoose.model('productSchema',  ProductSchema);


// async function uploadProduct(params){

//   const product = new productSchema(params)
//   await product.save()
//   return basicDetails(product)
// }

// async function getProducts(params){
//   let order = params.order ? params.order: "desc"
//   let sortBy = params.sortBy ? params.sortBy: "_id"
//   let limit = params.limit ? parseInt(params.limit) : 100
//   let skip = parseInt(params.skip)

//   let findArgs = {}
//   let term = params.searchTerm

//   for(let key in params.filters){
//     if(params.filters[key].length > 0){

//       if(key === "price"){
            
//         findArgs[key] = {
//           $gte: params.filters[key][0],
//           $lte: params.filters[key][1]
//         }
        
//       }else{
//         findArgs[key] = params.filters[key]
//       }
//     }
//   }

//   if (term){
//     const product = 
//     await productSchema
//     .find(findArgs) 
//     .find({ $text: { $search: term }})
//     .populate("writer")
//     .sort([[sortBy, order]])
//     .skip(skip)
//     .limit(limit)
              
//     return product.map(product => basicDetails(product))
//   }else{
//     const product = 
//     await productSchema
//     .find(findArgs) 
//     .populate("writer")
//     .sort([[sortBy, order]])
//     .skip(skip)
//     .limit(limit)
              
//     return product.map(product => basicDetails(product))
//   }
  
                     
// }

// function basicDetails(product) {
//   const { id, writer, title, description, images, price, continents  } = product;
//   return { id, writer, title, description, images, price, continents };
// }

// // async function getProductById(id){
// //   const product = await productSchema.findById(id)
// //   return basicDetails(product)
// // }

// async function _delete(id){
//   const product = await productSchema.findById(id)
//   await product.remove()
// }



// ////////////////////////////////
// var storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads/')
//   },
//   filename: function (req, file, cb) {
//     cb(null, `${Date.now()}_${file.originalname}`)
//   },
//   fileFilter: function (req, file, cb) {
//     const ext = path.extname(file.originalname)
//     if (ext !== '.jpg' && ext !== '.png'){
//       return cb(res.status(408).end("only jpg,png,mp4 is allowed"), false)
//     }
//     cb(null, true)
//   }
// })
 
// var upload = multer({ storage: storage }).single("file")


// module.exports = {
//     upload,
//     uploadProduct,
//     getProducts,
//     delete: _delete,
//     productSchema
// }
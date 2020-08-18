const express = require('express');
const router = express.Router();
const   accountService  = require('../models/account')
const  { Product } = require('../models/product')
const { Payment } = require('../models/Payment')
const authorize = require('../middleware/authorize')
const Role = require('../models/role')
const validate = require('../middleware/validate')
const Joi = require('@hapi/joi')
const async = require('async')

router.post('/register', registerSchema, register)
router.post('/verify-email', verifyEmailSchema, verifyEmail)
router.post('/authenticate',  authenticateSchema, authenticate)
router.post('/forgot-password',forgotPasswordSchema, forgotPassword)
router.post('/validate-reset-token', validateResetTokenSchema, validateResetToken);
router.post('/reset-password', resetPasswordSchema, resetPassword)
router.get('/', authorize(Role.Admin), getAccounts)
router.get('/:id',authorize(), getAccountById)
router.post('/',authorize(Role.Admin), createSchema, create)
router.put('/:id',authorize(), updateSchema, update)
router.delete('/:id',authorize(), _delete)

 router.get('/product/addToCart',  (req, res) => {
     accountService.accountSchema.findOne({ id: req.body.id}, (err, userInfo) => {
         //console.log(req.body.id, userInfo)
          
         let duplicate = false
         userInfo.cart.forEach((item) => {
            if (item.id == req.query.productId) {
                duplicate = true;
            }
        })


        if (duplicate) {
            accountService.accountSchema.findOneAndUpdate(
                { id: req.id, "cart.id": req.query.productId },
                { $inc: { "cart.$.quantity": 1 } },
                { new: true },
                (err, userInfo) => {
                    if (err) return res.json({ success: false, err });
                    res.status(200).json(userInfo.cart)
                }
            )
        } else {
            accountService.accountSchema.findOneAndUpdate(
                { id: req.id },
                {
                    $push: {
                        cart: {
                            id: req.query.productId,
                            quantity: 1,
                            date: Date.now()
                        }
                    }
                },
                { new: true },
                (err, userInfo) => {
                    if (err) return res.json({ success: false, err });
                    res.status(200).json(userInfo.cart)
                }
            )
        }


     })
 })

 router.get('/user/removeFromCart', (req, res) => {
    accountService.accountSchema.findOneAndUpdate(
        { id: req.id },
        { 
            "$pull": 
                    { "cart": {"id":req.query.id}} 
        },
        { new: true},
        (err, userInfo) => {
          let cart = userInfo.cart
          let array = cart.map(item => {
              return item.id
          })
          Product.find({ '_id': { $in: array}})
          .populate('writer')
          .exec((err, cartDetail) => {
              return res.status(200).json({
                  cartDetail,
                  cart
              })
          })
        }
    )
 })

 router.post('/user/successBuy', (req, res) => {
     let history = []
     let transactionData = {}

     req.body.cartDetail.forEach((item) =>{
         history.push({
            dateOfPurchase: Date.now(),
            name: item.title,
            id: item._id,
            price: item.price,
            quantity: item.quantity,
            paymentId: req.body.paymentData.paymentID
         })
     })

     transactionData.user = {
        id: req.body.id,
        firstName: req.body.firstName,
       lastName: req.body.lastName,
       email: req.body.email
     }

     transactionData.data = req.body.paymentData;
     transactionData.product = history

     accountService.accountSchema.findOneAndUpdate(
         {id: req.id},
         { $push: { history: history}, $set: {cart: []}},
         { new: true},
         (err, user) => {
            if (err) return res.json({ success: false, err });

            const payment = new Payment(transactionData)
            payment.save((err, doc) =>{
                if (err) return res.json({ success: false, err });

                 let products = []
                 doc.product.forEach(item => {
                     products.push({id: item.id, quantity: item.quantity})
                 })
                async.eachSeries(products, (item, callback) => {
                    Product.update(
                        {_id: item.id},
                        { 
                            $inc: {"sold": item.quantity}
                        },
                        {new: false},
                        callback
                    )
                }, (err) => {
                    if (err) return res.json({ success: false, err });
                    res.status(200).json({
                        success: true,
                        cart: user.cart,
                        cartDetail: []
                    })
                })
            })
         }
     )
 })

 router.get('/user/getHistory', (req, res) => {
    accountService.accountSchema.findOne(
        { id: req.body.id },
        (err, doc) => {
            let history = doc.history;
            if (err) return res.status(400).send(err)
            return res.status(200).json({ success: true, history })
        }
    )
})
module.exports = router;

///////////////////////////
function registerSchema(req, res, next) {
    const schema = Joi.object({
        title: Joi.string(),
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        bio: Joi.string(),
        website:  Joi.string(),
        location:  Joi.string(),
        imageUrl:  Joi.string(),
        confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
        acceptTerms: Joi.boolean().valid(true).required()
    });
    validate(req, next, schema);
}
function register(req, res, next){
    accountService.register(req.body, req.get('origin'))
    .then(() => {
        res.status(200).json({
            message: 'Registration successful, please check your email for verification instructions' ,
        })
    }).catch((err) => next(err))
}
/////////////////////////////////
function verifyEmailSchema(req, res, next) {
    const schema = Joi.object({
        token: Joi.string().required()
    });
    validate(req, next, schema);
}
function verifyEmail (req, res, next){
    accountService.verifyEmail(req.body)
    .then(() => {
        res.status(201).json({
            message: 'Verification successful, you can now login' 
        })
    }).catch((err) => next(err))
}
//////////////////////////////////
function authenticateSchema(req, res, next) {
    const schema = Joi.object({
        email: Joi.string().required(),
        password: Joi.string().required()
    });
    validate(req, next, schema);
}

function  authenticate (req, res, next){
    accountService.authenticate(req.body)
    .then(account => account ? res.json(account) : res.status(400).json({ message: 'Email or password is incorrect' }))
    .catch((err) => next(err))
}
/////////////////////////////////
function forgotPasswordSchema(req, res, next) {
    const schema = Joi.object({
        email: Joi.string().email().required()
    });
    validate(req, next, schema);
}

function forgotPassword(req, res, next){
    accountService.forgotPassword(req.body, req.get('origin'))
    .then(() => res.status(200).json({ message: 'Please check your email for password reset instructions' }))
    .catch((err) => 
        next(err)
    )
}
////////////////////////////////////
function resetPasswordSchema(req, res, next) {
    const schema = Joi.object({
        token: Joi.string().required(),
        password: Joi.string().min(6).required(),
        confirmPassword: Joi.string().valid(Joi.ref('password')).required()
    });
    validate(req, next, schema);
}
function resetPassword(req, res, next){
    accountService.resetPassword(req.body)
    .then(() => {
        res.status(201).json({
            message: 'Password reset successfully, you can now login' 
        })
    }).catch((err) => next(err))
}
/////////////////////////////
function validateResetTokenSchema(req, res, next) {
    const schema = Joi.object({
        token: Joi.string().required()
    });
    validate(req, next, schema);        
}

function validateResetToken(req, res, next) {
    accountService.validateResetToken(req.body)
        .then(() => res.json({ message: 'Token is valid' }))
        .catch(err => next(err));
}

////////////////////////////
function getAccounts(req, res, next){
    accountService.getAccounts()
    .then(accounts => {
        res.json(accounts)
    }).catch((err) => next(err))
}

function getAccountById(req, res, next){
    if (req.params.id !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    accountService.getAccountById(req.params.id)
    .then(account => account ? res.json(account) : res.status(404)
    ).catch((err) => next(err))
}
////////////////////////////////////////////////
function createSchema(req, res, next) {
    const schema = Joi.object({
        title: Joi.string(),
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
        role: Joi.string().valid(Role.Admin, Role.User).empty('').required(),
        bio: Joi.string(),
        website:  Joi.string(),
        location:  Joi.string(),
        imageUrl:  Joi.string(),
    });
    validate(req, next, schema);
}
function create(req, res, next){
    accountService.create(req.body)
    .then(account => account ? res.json(account) : res.status(404)
    ).catch((err) => next(err))

}
/////////////////////////////////////

function updateSchema(req, res, next) {
    const schemaRules = {
        title: Joi.string().empty(''),
        firstName: Joi.string().empty(''),
        lastName: Joi.string().empty(''),
        email: Joi.string().email().empty(''),
        bio: Joi.string().empty(''),
        website:  Joi.string().empty(''),
        location:  Joi.string().empty(''),
        imageUrl:  Joi.string().empty(''),
        password: Joi.string().min(6).empty(''),
        confirmPassword: Joi.string().valid(Joi.ref('password')).empty('')
    };
    
    // only admins can update role
    if (req.user.role === Role.User) {
        schemaRules.role = Joi.string().valid(Role.Admin, Role.User).empty('');
    }

    const schema = Joi.object(schemaRules).with('password', 'confirmPassword');
    validate(req, next, schema);
}
function update(req, res, next){
    if (req.params.id !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    accountService.update(req.params.id, req.body)
    .then(account => account ? res.json(account) : res.status(404)
    ).catch((err) => next(err))
}
//////////////////////

/////////////////////////
function _delete(req, res, next){
    if (req.params.id !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    accountService.delete(req.params.id)
    .then(() => res.json({ message: 'Account deleted Successfully'}))
    .catch((err) => next(err))
}
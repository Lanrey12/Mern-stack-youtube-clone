const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const subscriberSchema = mongoose.Schema({
    userTo: {
        type: Schema.Types.ObjectId,
        ref: 'accountSchema'
    },
    userFrom: {
        type: Schema.Types.ObjectId,
        ref: 'accountSchema'
    },


}, { timestamps: true })




const Subscriber = mongoose.model('Subscriber', subscriberSchema);

// async function _delete(id){
//   const product = await Product.findById(id)
//   await product.remove()
// }

module.exports = { 
    Subscriber, 
 // delete: _delete 
}
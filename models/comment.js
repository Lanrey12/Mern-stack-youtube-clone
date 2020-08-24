const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = mongoose.Schema({
    writer: {
        type: Schema.Types.ObjectId,
        ref: 'accountSchema'
    },
    postId: {
        type: Schema.Types.ObjectId,
        ref: 'Video'
    },
    responseTo:{
         type: Schema.Types.ObjectId,
         ref: 'accountSchema'
    },
    content: {
        type: String
    }


}, { timestamps: true })




const Comment = mongoose.model('Comment', commentSchema);

// async function _delete(id){
//   const product = await Product.findById(id)
//   await product.remove()
// }

module.exports = { 
    Comment, 
 // delete: _delete 
}
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dislikeSchema = mongoose.Schema({
    
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'accountSchema'
    },
    commentId:{
        type: Schema.Types.ObjectId,
        ref: 'Comment'
   },
    videoId: {
        type: Schema.Types.ObjectId,
        ref: 'Video'
    }


}, { timestamps: true })




const Dislike = mongoose.model('Dislike', dislikeSchema);

// async function _delete(id){
//   const product = await Product.findById(id)
//   await product.remove()
// }

module.exports = { 
    Dislike, 
 // delete: _delete 
}
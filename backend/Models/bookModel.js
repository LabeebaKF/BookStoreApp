const mongoose=require('mongoose')
const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: { type: Number, required: true },
  review: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const bookSchema=new mongoose.Schema({
    title:{type:String,required:true},
    author:String,
    price:Number,
    genre:String,
    imageUrl:String,
    description:String,
    stock:Number,
    publicationYear: Number,
    reviews: [reviewSchema], 
    isFeatured: { 
        type: Boolean, 
        default: false 
    } 
})
module.exports=mongoose.model('bookdetails',bookSchema)


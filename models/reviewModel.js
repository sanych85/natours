//review/rating/createdAt/ref to Tour/ref to user
const mongoose = require('mongoose');
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can"t be empty'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      // required: [true, "rating is required"],
      // default: "no rating"
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      // select: false
    },

    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'review must belong to a user'],
    },
  },
  {
    //каждый раз когда мы трансформируем наш объект в JSON формат виртуальные опции делаем доступными
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
reviewSchema.pre(/^find/, function(next) {
  // this.populate({
  //   path: 'tour',
  //   select: 'name'
  // }).populate({
  //   path: 'user',
  //   select: 'name photo'
  // })
  // next()
  this.populate({
    path: 'user',
    select: 'name photo'
  })
  next()
})

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;

//POST //tour/2324234/reviews/
//GET //tour/2324234/reviews/
//GET //tour/2324234/reviews/653dfgdfg

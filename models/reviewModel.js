//review/rating/createdAt/ref to Tour/ref to user
const mongoose = require('mongoose');
const { findByIdAndUpdate, findOneAndDelete } = require('./tourModel');
const Tour = require('./tourModel')
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

// reviewSchema.index({tour:1, user:1},{unique:true})
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

reviewSchema.statics.calcAverageRatings =async function(tourId){
  const stats = await this.aggregate([
    {
      //собираем все ревьюшки, которые относятся к переданному туру
      $match:{tour:tourId}
    },
    //вычисляем статистику
    {
      $group: {
        _id: '$tour',
        //добавляем по единичке для подсчета количества
        nRatings: {$sum:1},
        avgRating:{$avg: '$rating'}
      }
    }

  ])
  // console.log(stats)
  if(stats.length>0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRatings,
      ratingsAverage:stats[0].avgRating
    })
  }
  else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage:4.5
  })
} 

}

reviewSchema.post('save', function(){
  //this указывает на текущее ревью
  
  this.constructor.calcAverageRatings(this.tour)
  
})

// findByIdAndUpdate
// findOneAndDelete
reviewSchema.pre(/^findOneAnd/, async function(next){
  this.r = await this.findOne()
  next()
})

reviewSchema.post(/^findOneAnd/, async function(){
  //await this.findOne() does not work here, query already executed
  await this.r.constructor.calcAverageRatings(this.r.tour)
})

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;


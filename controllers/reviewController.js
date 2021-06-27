const Review = require('./../models/reviewModel')
// const catchAssync = require('./../utils/catchAssync')
const factory = require('./handlerFactory')
// exports.getAllReviews = catchAssync(async (req,res,next)=> {
//     let filter = {}
//     if(req.params.tourId) filter = {tour:req.params.tourId}
//     const reviews = await Review.find(filter)
    
//     res.status(200).json({
//         status:'success',
//         results:reviews.length,
//         data:{
//             reviews
//         }
//     })
// })


exports.setTourUserIds = (req,res,next)=> {
    //так как эта часть отличается в createRoutes от аналогичной в tourRoutes , то ее мы выносим в данноую функцию и как промежуточный middleware добавляем в наш reviewRoutes
    if(!req.body.tour) req.body.tour = req.params.tourId
    if(!req.body.user) req.body.user = req.user.id
    next()
}
exports.getAllReviews = factory.getAll(Review)
exports.getReview = factory.getOne(Review)
exports.createReview = factory.createOne(Review)
exports.updateReview = factory.updateOne(Review)
exports.deleteReview = factory.deleteOne(Review)
const express = require('express');
const fs = require('fs');
const authController = require('./../controllers/authController');
// const reviewController = require('./../controllers/reviewController');
const reviewRouter = require('./../routes/rewiewRoutes')
const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
  // checkId,
  // checkBody
} = require('./../controllers/tourController');
const router = express.Router();

//POST //tour/2324234/reviews/
//GET //tour/2324234/reviews/
//GET //tour/2324234/reviews/653dfgdfg

// router.route('/:tourId/reviews')
// .post(authController.protect,
//   authController.restrictTo('user'),
//   reviewController.createReview 
//   );

router.use('/:tourId/reviews',reviewRouter)

router.route('/top-5-cheap').get(aliasTopTours, getAllTours);
router.route('/tour-stats').get(getTourStats);
router.route('/monthly-plan/:year').get(getMonthlyPlan);

router.route('/').get(authController.protect, getAllTours).post(createTour);

//в удалении ниже пропускаем сразу через 2 middieware/ первый позволяет нам удалять туры только если мы автоизованы, а второй позволяет делать это только если у нас имеются админские функции.
router
  .route('/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    deleteTour
  );

  


module.exports = router;

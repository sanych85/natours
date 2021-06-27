const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

// router.route('/');

const router = express.Router({ mergeParams: true });

//отсюда и ниже все используют authController.protect
router.use(authController.protect)

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(authController.restrictTo('user','admin'), reviewController.updateReview)
  .delete(authController.restrictTo('user','admin'), reviewController.deleteReview);

module.exports = router;

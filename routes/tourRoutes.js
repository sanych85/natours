const express = require('express');
const fs = require('fs');

const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  aliasTopTours
  // checkId,
  // checkBody
} = require('./../controllers/tourController');
const router = express.Router();

router.route('/top-5-cheap').get(aliasTopTours,getAllTours)
// router.param('id', checkId);

//create a check body middleware function
//Check if body contain name an price


router.route('/').get(getAllTours).post(createTour);
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;

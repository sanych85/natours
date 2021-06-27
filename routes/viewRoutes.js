const express  = require('express')
const router = express.Router()
const viewsConroller = require('../controllers/viewsController')
const authController = require('../controllers/authController')
const bookingController = require('../controllers/bookingController')

router.get('/',bookingController.createBookingCheckout,  authController.isLoggedIn, viewsConroller.getOverview)
router.get('/tour/:slug', authController.isLoggedIn, viewsConroller.getTour)
router.get('/login', authController.isLoggedIn, viewsConroller.getLoginForm)
router.get('/signup',  viewsConroller.getSignUpForm)
router.get('/me',authController.protect,  viewsConroller.getAccount)
router.get('/my-tours', authController.protect, viewsConroller.getMyTours)

router.post('/submit-user-data', authController.protect, viewsConroller.updateUserData)

module.exports = router
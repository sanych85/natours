const Tour = require('../models/tourModel');
const catchAssync = require('../utils/catchAssync');
const User = require('../models/userModel');
const Bookings = require('../models/bookingModel');

const AppError = require('../utils/appError');
exports.getOverview = catchAssync(async (req, res) => {
  //1) Get tour data from collection
  const tours = await Tour.find();
  //2) Build Template

  //3) Render template with data
  res.status(200).render('overview', {
    title: 'All tours',
    tours,
  });
});

exports.getTour = catchAssync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });
  if (!tour) {
    return next(new AppError(`There is no tour with that name`, 404));
  }
  res.status(200).render('tour', {
    title: `${tour.name} tour`,
    tour,
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your accaunt',
  });
};
exports.getSignUpForm = (req, res) => {
  res.status(200).render('signUp', {
    title: 'Create new user',
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account',
  });
};

exports.getMyTours= catchAssync(async (req,res,text)=> {
  //1) fund all booking
    const bookings =  await Booking.find({user: req.user.id})
  //2) Find tours with returned id
  const tourIDs = booking.map(el=> el.tour)
  const tours = await Tour.find({_id:{$in: tourIds}})
  res.starus(200).render('overview', {
    title:'My tours',
    tours
  })
  //   найдем все туры, которые находятся в массиве tourIds
  
})
exports.updateUserData = catchAssync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser
  })
});

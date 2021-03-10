const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apifeatures');
const catchAssync = require('./../utils/catchAssync');
const appError = require('./../utils/appError');
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};
// exports.checkBody =(req,res,next)=> {
//   if(!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'no name or price',
//     });
//   }
//   next()
// }

exports.getAllTours = catchAssync(async (req, res,next) => {
  //EXECUTION Query
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tours = await features.query;

  //SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

exports.getTour = catchAssync(async (req, res,next) => {
  const tour = await Tour.findById(req.params.id);
  // console.log(tour);
  if(!tour) {
    return next(new appError('No tour found with that id', 404))
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.createTour = catchAssync(async (req, res,next) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});
exports.updateTour = catchAssync(async (req, res,next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if(!tour) {
    return next(new appError('No tour found with that id', 404))
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.deleteTour = catchAssync(async (req, res,next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  if(!tour) {
    return next(new appError('No tour found with that id', 404))
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getTourStats = catchAssync(async (req, res,next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    { $sort: { avgPrice: 1 } },
    // {$match: {_id:{$ne: "EASY"}}}
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAssync(async (req, res,next) => {
  //1 ниже для превращения в число
  console.log('monthlyPlan');
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    //определяем тур, который бы отвечал требованиям по дате, в частности относился бы к 2021 году
    {
      $match: {
        startDates: {
          //указываем, что дата должна быть в течении 1 года
          $gte: new Date(`${year}-06-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        //группируем наши туры по месяцам, в каком месяце сколько туров
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        //добавляем в имеющиеся данные названия туров
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        //теперь скрываем Id
        _id: 0,
      },
    },
    {
      //сортировка по убыванию
      $sort: {
        numTourStarts: -1,
      },
    },
    {
      //ограничение на показ туров
      $limit: 12,
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});

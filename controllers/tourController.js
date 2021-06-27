const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apifeatures');
const sharp = require('sharp');
const multer = require('multer');
const catchAssync = require('./../utils/catchAssync');

const factory = require('./handlerFactory');
const AppError = require('./../utils/appError');

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only image', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  filter: multerFilter,
});

exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);
// upload.singlt('image') создаст req.file
// upload.array('images', 5) cjplfcn req.files
exports.resizeTourImages = catchAssync(async (req, res, next) => {

  if (!req.files.imageCover || !req.files.images) return next();
  console.log('Оптимизация изображения');
  //1) Cover images
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  
  //2) Images
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);
      req.body.images.push(filename);
    })
  );
  // console.log(body)
  next();
});

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

exports.getAllTours = catchAssync(async (req, res, next) => {
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

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });

exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);

exports.deleteTour = factory.deleteOne(Tour);

exports.getTourStats = catchAssync(async (req, res, next) => {
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

exports.getMonthlyPlan = catchAssync(async (req, res, next) => {
  //1 ниже для превращения в число

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
// router.route('/tour-within/:distance/center/:latlng/unit/:unit')
exports.getToursWithin = catchAssync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  console.log('latlng', latlng);
  const [lat, lng] = latlng.split(',');
  //  const lat = latlng.split(',')[0]
  //  const lng = latlng.split(',')[1]
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  if (!lat || !lng) {
    next(new AppError('Please proveid lat and lng in correct format'));
  }

  // const tours = await Tour.find({
  //   startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  // });
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.getDistances = catchAssync(async (req, res, next) => {
  const { latlng, unit } = req.params;

  const [lat, lng] = latlng.split(',');
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(new AppError('Please proveid lat and lng in correct format', 400));
  }
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          //умножаем на 1 ниже для того чтобы конвертировать это в число
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        //автоматическое разделене, чтобы превратить результат в метрах в километры
        distanceMultiplier: multiplier,
      },
    },
    //ниже в project (видимо типовое поле) передаем только те поля, которые хотим сохранить
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',

    data: {
      data: distances,
    },
  });
});

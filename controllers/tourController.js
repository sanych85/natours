const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apifeatures')
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



exports.getAllTours = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};
exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    // console.log(tour);
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'faille',
      message: err,
    });
  }
};
exports.createTour = async (req, res) => {
  try {
    //  const newTour = new Tour({
    //  })
    //  newTour.save()
    //это альтернатива тому, что закоментировано выше.
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      data: {
        message: err,
      },
    });
  }
};
exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      data: {
        message: err,
      },
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      data: {
        message: err,
      },
    });
  }
};

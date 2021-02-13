const Tour = require('./../models/tourModel');

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
      //BUILD QUERY
    //1)Filtering
      const queryObj = {...req.query}
      const excludedFields= ['page', 'sort', 'limit','fields']
      excludedFields.forEach(el=>delete queryObj[el])
  
    //2) ADvanced filtering
  
    let queryStr = JSON.stringify(queryObj)
    queryStr= queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match=> 
      `$${match}`)
    
    console.log(JSON.parse(queryStr))
 
    const query =  Tour.find(JSON.parse(queryStr))
   



    // EXECUTE QUERY
    const tours = await query
     //или 
    // const tours = await Tour.find()
    //   .where('duration')
    //   .equals(5)
    //   .where('difficulty')
    //   .equals('easy');

       // const tours = await Tour.find({
    //   duration:5,
    //   difficulty:'easy'
    // })

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
    console.log(tour);
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

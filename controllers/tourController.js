const Tour = require('./../models/tourModel');
exports.aliasTopTours = (req,res,next)=> {
  req.query.limit='5';
  req.query.sort = '-ratingsAverage'
  req.query.fields= 'name,price,ratingsAverage,summary,difficulty'
  next()
}
// exports.checkBody =(req,res,next)=> {
//   if(!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'no name or price',
//     });
//   }
//   next()
// }

class APIFeatures {
  constructor(query,queryString) {
    this.query = query;
    this.queryString= queryString
  }
  filter() {
    
  }
}

exports.getAllTours = async (req, res) => {
  try {
      //BUILD QUERY
    //1a)Filtering
      const queryObj = {...req.query}
      const excludedFields= ['page', 'sort', 'limit','fields']
      excludedFields.forEach(el=>delete queryObj[el])
  
    //1b) ADvanced filtering
  
    let queryStr = JSON.stringify(queryObj)
    queryStr= queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match=> 
      `$${match}`)
    
    // console.log(JSON.parse(queryStr))
    let query =  Tour.find(JSON.parse(queryStr))
  

    //2 sorting
    
    // console.log(sotrBy)

    if(req.query.sort) {
      const sotrBy =req.query.sort.split(',').join(' ');
     
      query = query.sort(sotrBy)
    }
    else {
    
      query = query.sort('createdAt')

    }
    console.log(req.query.fields)
    //3) Field limiting
    if(req.query.fields) {
      console.log(req.query)
      const fields = req.query.fields.split(',').join(' ');
      console.log(fields)
      query = query.select(fields)
      
      
    }
    else {
      query = query.select('-__v')
    }

    //4) Pagination
    const page= req.query.page*1||1
    const limit =req.query.limit*1||100
    const skip = (page-1)*limit
    //page=2&limit=50
    query = query.skip(skip).limit(limit)
    if(req.query.page){
      const numTours= await Tour.countDocuments()
      if(skip>=numTours) throw new Error("This page does not exists")
    }
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

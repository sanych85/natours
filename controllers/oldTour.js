const fs = require('fs');
const Tour = require('./../models/tourModel')
// const tours = JSON.parse(
//     fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
//   );

exports.checkId = (req,res,next,val)=> {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'invalid id',
    });
  }
  next()
}

exports.checkBody =(req,res,next)=> {
  if(!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'no name or price',
    });
  }
  next()
}



 exports.getAllTours = (req, res) => {
    console.log(req.requestTime);
    res.status(200).json({
      status: 'success',
      // results: tours.length,
      // requestesdAt: req.requestTime,
      // data: {
      //   tours,
      // },
    });
  };
   exports.getTour = (req, res) => {
    console.log(req.params);
    const id = req.params.id * 1;

  };
   exports.createTour = (req, res) => {
    res.status(201).json({
      status: 'success',
      // data: {
      //   tour: newTour,
      // },
    });


    // console.log(req.body);
    // const newId = tours[tours.length - 1].id + 1;
    // const newTour = Object.assign({ id: newId }, req.body);
    // tours.push(newTour);
    // fs.writeFile(
    //   `${__dirname}/dev-data/data/tours-simple.json`,
    //   JSON.stringify(tours),
    //   (err) => {
    //     res.status(201).json({
    //       status: 'success',
    //       data: {
    //         tour: newTour,
    //       },
    //     });
    //   }
    // );
    // res.send('DONE')
  };
  exports.updateTour = (req, res) => {
    // if (req.params.id * 1 > tours.length) {
    //   return res.status(404).json({
    //     status: 'fail',
    //     message: 'invalid id',
    //   });
    // }
    res.status(200).json({
      status: 'success',
      data: {
        tour: 'update your tour here',
      },
    });
  };
  
   exports.deleteTour = (req, res) => {

    res.status(204).json({
      status: 'success',
      data: null,
    });
  };
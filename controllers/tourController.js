
const Tour = require('./../models/tourModel')




// exports.checkBody =(req,res,next)=> {
//   if(!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'no name or price',
//     });
//   }
//   next()
// }



 exports.getAllTours = (req, res) => {
    console.log(req.requestTime);
    res.status(200).json({
      status: 'success',

    });
  };
   exports.getTour = (req, res) => {
    console.log(req.params);
    const id = req.params.id * 1;

  };
   exports.createTour = async (req, res) => {
     try {
        //  const newTour = new Tour({
    //  })
    //  newTour.save()
    //это альтернатива тому, что закоментировано выше.
    const newTour= await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour
      }

    });
       
     }
     catch(err) {
       res.status(400).json({
         status:"fail",
         data: {
           message:err
         }
       })
     }
   

  };
  exports.updateTour = (req, res) => {

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
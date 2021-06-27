const catchAssync = require('./../utils/catchAssync');
const appError = require('./../utils/appError');
const APIFeatures = require('./../utils/apifeatures')

exports.deleteOne = (Model) => {
  return catchAssync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new appError('No document found with that id', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
};

exports.updateOne = (Model) =>
  catchAssync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new appError('No document found with that id', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAssync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

  exports.getOne=(Model,popOptions) => catchAssync (async (req,res,next)=> {
     
      let query = Model.findById(req.params.id)
   
        //populate используем чтобы в наших турах была ссылка на юзеров, относящихся к данным турам и чтобы она была как бы встраиваемой. В данном случае это ссылка на поле "guides"
        if(popOptions) query=query.populate(popOptions)
        const doc = await query
       
        if(!doc) {
          return next(new appError('No tour found with that id', 404))
        }
        res.status(200).json({
          status: 'success',
          data: {
            data:doc,
          },
        });
     
    })

    exports.getAll =(Model)=>catchAssync(async (req, res,next) => {
       
        //only for nested GET reviews tour
        let filter = {}
        if(req.params.tourId) filter = {tour:req.params.tourId}
        // const reviews = await Review.find(filter)
        const features = new APIFeatures(Model.find(filter), req.query)
          .filter()
          .sort()
          .limitFields()
          .paginate();
          //explain метод используется для сбора информации о запросах и различной статистики
        // const doc = await features.query.explain();
        const doc = await features.query;
      
        //SEND RESPONSE
        res.status(200).json({
          status: 'success',
          results: doc.length,
          data: {
            doc,
          },
        });
      });
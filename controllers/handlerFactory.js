const catchAssync = require('./../utils/catchAssync');
const appError = require('./../utils/appError');

exports.deleteOne = Model=> {
    return catchAssync(async (req, res,next) => {
        const doc = await Model.findByIdAndDelete(req.params.id);
        if(!doc) {
          return next(new appError('No document found with that id', 404))
        }
        res.status(204).json({
          status: 'success',
          data: null,
        });
      })
}

exports.updateOne = Model => catchAssync(async (req, res,next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
  
    if(!doc) {
      return next(new appError('No document found with that id', 404))
    }
    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });
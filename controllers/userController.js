const User = require('./../models/userModel');
const AppError = require('./../utils/appError');
const catchAssync = require('./../utils/catchAssync');
const factory = require('./handlerFactory')

const filterObj = (obj,...allowedFields)=> {

  const newObj = {}
  Object.keys(obj).forEach(el=> {
    if(allowedFields.includes(el)) {
      newObj[el] = obj[el]
    }
  })
 
  return newObj
}
exports.getAllUsers = catchAssync(async (req, res) => {
  // console.log(req.requestTime);
  // res.status(200).json({
  //   status: 'success',
    
  //   requestesdAt: req.requestTime,
  
  // });
  const users = await User.find();
  //SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

//updating current user, not as admin. Current user can update only information related to him
exports.updateMe =catchAssync( async (req,res,next)=> {
  // 1) create error if user POSTs password data
  if(req.body.password|| req.body.passwordConfirm) {
    return next(new AppError("This route is not for password updates. Please use updateMyPassword",400))
  }

  //Фильтруем только необходимые поля, которые можетм апдейтить , а не полностью все в req.body
  const filteredBody = filterObj(req.body, "name", "email")

    // 2) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody ,{new:true,runValidators:true} )
  res.status(200).json({
    status:"success",
    data: {
      user:updatedUser
    }
  })
})

//Delete user
exports.deleteMe =catchAssync(async(req,res,next)=> {
 
  await User.findByIdAndUpdate(req.user.id, {active:false})
  res.status(204).json({
    status:"success",
    data: null
  })
})

 exports.createUser = (req, res) => {
   
    const newId = users[users.length - 1].id + 1;
    const newTour = Object.assign({ id: newId }, req.body);
    users.push(newTour);
    fs.writeFile(
      `${__dirname}/dev-data/data/users-simple.json`,
      JSON.stringify(users),
      (err) => {
        res.status(201).json({
          status: 'success',
          data: {
            user: newTour,
          },
        });
      }
    );
    // res.send('DONE')
  };
  
   exports.getUser = catchAssync(async (req, res) => {
  
    
    const users = await User.find();
    // const id = req.params.id * 1;
    const id =req.params.id
    const user = users.find(el=> {
  
    
      return el._id.toString()===id
    })
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'invalid id',
      });
    }
    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  });
  



   exports.updateUser = (req, res) => {
    if (req.params.id * 1 > users.length) {
      return res.status(500).json({
        status: 'fail',
        message: 'invalid id',
      });
    }
    res.status(200).json({
      status: 'success',
      data: {
        user: 'update your user here',
      },
    });
  };
  
   exports.deleteUser = (req, res) => {
    if (req.params.id * 1 > users.length) {
      return res.status(404).json({
        status: 'fail',
        message: 'invalid id',
      });
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  };

  exports.deleteUser= factory.deleteOne(User)
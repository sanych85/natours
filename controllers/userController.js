const User = require('./../models/userModel');
const catchAssync = require('./../utils/catchAssync');

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

 exports.createUser = (req, res) => {
    console.log(req.body);
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
  
   exports.getUser = (req, res) => {
    console.log(req.params);
    const id = req.params.id * 1;
    const user = users.find((el) => el.id === id);
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
  };
  



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
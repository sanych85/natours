const User = require('./../models/userModel');
const sharp = require('sharp');
const multer = require('multer');
const AppError = require('./../utils/appError');
const catchAssync = require('./../utils/catchAssync');
const factory = require('./handlerFactory');


// const multerStorage = multer.diskStorage({
//   destination: (req,file,cb)=> {
//     cb(null, "public/img/users")
//   },
//   filename:(req,file, cb)=> {
//     const ext =file.mimetype.split('/')[1]
//     cb(null,`user-${req.user.id}-${Date.now()}.${ext}`)
//   }
// })
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
exports.uploadUserPhoto = upload.single('photo');

//изменение размера изображений
exports.resizeUserPhoto =catchAssync( async (req, res, next) => {
  if ((!req.file)) return next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`
  //изменяем размер наших изборажение и конвертируем их принудительно в jpeg
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
    next()
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });

  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

//updating current user, not as admin. Current user can update only information related to him
exports.updateMe = catchAssync(async (req, res, next) => {
  // 1) create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use updateMyPassword',
        400
      )
    );
  }

  //Фильтруем только необходимые поля, которые можетм апдейтить , а не полностью все в req.body
  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;

  // 2) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

//Delete user
exports.deleteMe = catchAssync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

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
          message: 'This route is not defined. Please use sign up',
        },
      });
    }
  );
};

exports.getUser = factory.getOne(User);
exports.getAllUsers = factory.getAll(User);

//do not update password with this
exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);

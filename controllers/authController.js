const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('./../models/userModel');
const catchAssync = require('./../utils/catchAssync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');
const { now } = require('mongoose');



const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_JN,
  });
};

const createAndSendToken = (user, statusCode,res)=> {
  const token = signToken(user._id);
  const cookieOptions =  {
    expires: new Date(Date.now()+process.env.JWT_COOKIE_EXPIRES_IN*24*60*60*1000),
    
    httpOnly: true
  }
  if(process.env.NODE_ENV==="production") {
    cookieOptions.secure = true
  }
  res.cookie('jwt', token,cookieOptions)

  //удаление пароля из вывода
  user.password = "undefined"
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    },
  });
}

exports.signup = catchAssync(async (req, res, next) => {
  // const newUser = await User.create(req.body);
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });
  createAndSendToken(newUser, 201,res)
});

exports.login = catchAssync(async (req, res, next) => {
  const { email, password } = req.body;

  //1) Chrck if email and password exists
  if (!email || !password) {
    return next(new AppError('Please provide email and passwoed!', 400));
  }
  //2) check if password correct and select user by email
  //2.1 сначала пытаемся найти пользователя по его email
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    //401 -значит неавторизован
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3) If everithing ok, send token to client
  createAndSendToken(user, 200,res)
  
});

exports.protect = catchAssync(async (req, res, next) => {
  // console.log(req)
  //1) Get token and check if its exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
    console.log(req.headers.authorization.split(' ')[1]);
  }

  if (!token) {
    return next(new AppError('You are not login', 401));
  }

  //2) validate token(verification ) проверяем не манипулирует ли кто-то с токеном и не истек ли его срок
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The token belonging to this user does no longer exists',
        401
      )
    );
  }

  // 4) check if user change password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('user recently changed password. Please login again', 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});

//используем rest для того, чтобы получать все аргументы, которые мы передаем в функцию.
exports.restrictTo = (...roles) => {
  return (req, res, next) => {

    if (!roles.includes(req.user.role)) {
      //403 -forbidden
      return next(
        new AppError(`You have no permissionto perform this action`, 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAssync(async (req, res, next) => {
  //1)Get user by POSTemail
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError(`there is no user with email adress`, 404));
  }
  //2) Generate random token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  //3) Send it to user
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}}`;
  const message = `Forgot your password? Submit a patch request your new password and passwordConfirm to:${resetURL}.\n If you didnt forget your password please ignore it`;
  try {
 

    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
    
  } catch (err) {
   
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(`There was an error sendinf the email. Try again later`),
      500
    );
  }
});
exports.resetPassword = catchAssync(async (req, res, next) => {
  // 1) get user based on token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

    //находим юзера по нужному параметра и если у него истек срок хранения пароля
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  //2) if token has not expires ande there is user, set new password
    if(!user) {
        return next(new AppError('Token is invalid or has expired', 400))
    }
    
    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save()
  //3) update changePasswordAt property for the user

  // 4) Log the user in, send JWT
  createAndSendToken(user, 200,res)

});


exports.updatePassword = catchAssync(async (req,res,next)=> {
  //1) Get user from the collection
  const user = await  User.findById(req.user.id).select('+password')

  //2) Check if POSTed current password correce
  if(!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password wrong', 401))
  }
  //3) If so update password


    user.password =req.body.password
    user.passwordConfirm =req.body.passwordConfirm
    // console.log(user);
     await user.save();
    console.log("after await DOne")
  //4) Log user in? send JWT
  createAndSendToken(user, 200,res)
})

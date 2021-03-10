const jwt = require('jsonwebtoken')
const User = require('./../models/userModel')
const catchAssync = require('./../utils/catchAssync');
const AppError = require('./../utils/appError')

const signToken = id => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn:process.env.JWT_EXPIRES_JN
    })
}

exports.signup = catchAssync(async(req, res, next)=> {
    // const newUser = await User.create(req.body);
    const newUser = await User.create({
        name: req.body.name,
        email:req.body.email,
        password: req.body.password,
        passwordConfirm:req.body.passwordConfirm
    });
    const token = signToken(newUser._id)
    // const token = jwt.sign({id: newUser._id}, process.env.JWT_SECRET, {
    //     expiresIn:process.env.JWT_EXPIRES_JN
    // })
    res.status(201).json({
        status: "success",
        token,
        data: {
            user: newUser
        }
    })
})


exports.login = catchAssync(async(req,res,next)=> {

    const {email,password} = req.body;
    console.log("email",email)
    console.log("password",password)
    //1) Chrck if email and password exists
    if(!email|| !password ) {
       return next(new AppError('Please provide email and passwoed!', 400))
    }
    //2) check if password correct and select user by email
    //2.1 сначала пытаемся найти пользователя по его email
    const user = await User.findOne({email}).select('+password')
    console.log("user", user)
    if(!user|| !(await user.correctPassword(password, user.password))) {
        //401 -значит неавторизован
        return next(new AppError('Incorrect email or password', 401))
    }

    // 3) If everithing ok, send token to client
    const token = signToken(user._id)
    res.status(200).json({
        status:"success",
        token
    })
})
const mongoose = require('mongoose');
const valiadator = require('validator')
const bcrypt = require('bcryptjs')
const userSchema = new mongoose.Schema({
    name: {
        type:String,
        required: [true, 'Please tell us your name']
    },
    email: {
        type:String,
        requred: [true, 'Please provide email'],
        unique:true,
        lowercase: true,
        validate: [valiadator.isEmail, "Please provide valid email"]
    },
    photo: String,
    password: {
        type:String,
        requred: [true, "please proveid password"],
        minLength:8,
        select:false
    },
    passwordConfirm: {
        type:String,
        required: [true, "Please confirm password"],
        validate: {
            //This only works on CREATE and SAVE
            validator: function(el){
                return el===this.password
            },
            message: "Passwords are not the same"
        }
    }


})

userSchema.pre('save', async function(next) {
    // криптуем только если пароль находимся  в состоянии модификации
    if(!this.isModified('password')) return next()

    // хешируем пароль со значением 12
    this.password = await bcrypt.hash(this.password,12)

    //delete passwordCOnfirm field
    this.passwordConfirm = undefined
    next()

})

userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    //сравниваем равен ли передаваемый пароль тому, что харнится в нашей базе данных. Так как хранится зашифрованный, то передаваемый мы тоже должны перевести в зашифрованный вид. ниже приведенная функция возвращает по факту либо да, либо нет.
    console.log("compare", await bcrypt.compare(candidatePassword, userPassword))
    return await bcrypt.compare(candidatePassword, userPassword)
}
const User = mongoose.model('User', userSchema)
module.exports = User
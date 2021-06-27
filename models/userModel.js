const crypto = require('crypto')
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
    photo: {type: String, default:'default.jpg'},
    role: {
        type: String,
        enum:['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
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
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type:Boolean,
        default:true,
        select:false
    }

})

userSchema.pre('save', async function(next) {
    // Only run this function if password was actually modified
    if (!this.isModified('password')) return next();
  
    // Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
  
    // Delete passwordConfirm field
    this.passwordConfirm = undefined;
    next();
  });

// userSchema.pre('save', async function(next) {

//     // криптуем только если пароль находимся  в состоянии модификации
//     if(!this.isModified('password')) return next()

//     // хешируем пароль со значением 12
//     this.password = await bcrypt.hash(this.password,12)

//     //delete passwordCOnfirm field
//     this.passwordConfirm = undefined
//     next()

// })

// //функция pre запустится перед тем как новый документ будет сохранен
// userSchema.pre('save', function(next){
   
//     //если у нас не модифицируемый документ или если он он новый, то мы пропускаем шаг
//     if(!this.isModified('password')|| this.isNew)return next()
//     this.passwordChangedAt = Date.now()-1000
//     next()
// })

//ниже ищем все запросы ,которые начинаются с find
//this points current query/ Находим все значения, где active не стоит в значении false.
//делается это для того чтобы не показывать в нашем ответе сведения, которые не активны
userSchema.pre(/^find/, function(next){
    this.find({active:{$ne: false}})
    next()
})
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    //сравниваем равен ли передаваемый пароль тому, что харнится в нашей базе данных. Так как хранится зашифрованный, то передаваемый мы тоже должны перевести в зашифрованный вид. ниже приведенная функция возвращает по факту либо да, либо нет.
    
    return await bcrypt.compare(candidatePassword, userPassword)
}

userSchema.methods.changedPasswordAfter = function(JWTTimestapm) {

    if(this.passwordChangedAt) {
        const changedTimesStapm = parseInt(this.passwordChangedAt.getTime()/1000,10)
       
        return JWTTimestapm < changedTimesStapm
    }
    //false mean not Change
    return false
}

userSchema.methods.createPasswordResetToken = function() {
    //использование встроенного криптомодуля
const resetToken = crypto.randomBytes(32).toString('hex');
this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')


this.passwordResetExpires = Date.now()+10*50*1000

return resetToken
}

const User = mongoose.model('User', userSchema)
module.exports = User
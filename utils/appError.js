//наследование от встроенного класса
class AppError extends Error {
constructor (message, statusCode) {
super(message) 
 this.statusCode = statusCode;
 //если статус кода начинается с 4, то передаем фейл, иначе еррор
 this.status = `${statusCode}`.startsWith('4')? 'fail': 'error'
 this.isOperational=true
 Error.captureStackTrace(this, this.constructor)
}

}

module.exports = AppError;
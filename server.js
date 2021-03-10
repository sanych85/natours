const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const app = require('./app');

process.on('uncaughtException', err=> {
  
  console.log(err.name,  ` nameError: ${err.message}`)
  console.log("UNCAUGHT EXCEPTIONS")
    process.exit(1)

})

//подменяем пароль нашей переменной в файле config.env
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then((con) => {
    console.log('DB CONNECTION SUcces');
  }).catch(err=>console.log("Error"));


// const port = process.env.PORT || 3000;
const port = 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

process.on('unhandledRejection', err=> {
  console.log(err.name, err.message)
  console.log("UNHANDLER REJECTION")
  
  server.close(()=> {
    process.exit(1)
  })
})



//TEST

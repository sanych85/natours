const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const app = require('./app');

process.on('uncaughtException', err=> {
  

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
  }).catch(err=>console.log(" server something Error" , err));


// const port = process.env.PORT || 3000;
const port = 3000;
const server = app.listen(port, () => {

});

process.on('unhandledRejection', err=> {

  
  server.close(()=> {
    process.exit(1)
  })
})



//TEST

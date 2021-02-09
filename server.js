const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');
dotenv.config({ path: './config.env' });

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
  });


// //создаем тур, передаем название и схему по которой он будет создан
// const Tour = mongoose.model('Tour', tourSchema)
// const testTour = new Tour({
//   name: "park camper",
//   rating:4.7,
//   price:497
// })
// testTour.save().then(doc=>{
//   console.log(doc)
// }).catch(err=>{
//   console.log("Error",err)
// })

// const port = process.env.PORT || 3000;
const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

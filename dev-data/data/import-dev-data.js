const fs = require('fs')
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require("./../../models/tourModel")

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


//read JSON file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`,'utf-8'))

//Import data to database

const importData = async()=> {
    try {
       await Tour.create(tours) 
       console.log("data success loaded")
    }
    catch(err) {
        console.log(err)
    }
    process.exit()
}

//Delete all data from collection
const deleteData = async ()=> {
    try {
        await Tour.deleteMany()
        console.log("data succesfully deleted")
        
    }
    catch(err) {
        console.log(err)
    }
    process.exit()
}

if(process.argv[2]==='--import') {
    importData()
}
else if(process.argv[2]==='--delete') {
    deleteData()
}
console.log(process.argv)
const mongoose = require('mongoose');
const slugify = require('slugify');
const valiadator = require('validator')
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxLength: [40, 'A tour name must have less or equal 40 charact'],
      minLength: [10, 'A tour name must have more or equal 10 charact'],
      // validate:[valiadator.isAlpha, "Tour name must only contain characters"]

    },
    slug: String,
    duration: {
      type: Number,
      requred: [true, 'tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      requred: [true, 'tour must have a group size'],
    },
    difficulty: {
      type: String,
      requred: [true, 'tour must have difficulty'],
      enum: {
        values:['easy', 'medium', 'difficult'],
        message: "Difficulty is either: easy, medium,difficult"
      },
      }, 
    rating: {
      type: Number,
      default: 4.5,
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'rating must be above 1.0'],
      max: [5, 'rating must be below 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type:Number,
      validate: {
        message: "discount price ({VALUE}) should be lower than regular price",
        validator:function(val){
          //Это возможно только если мы создаем новый документ, а не апдейтим старый. Проблема в this
          return val <this.price
        }
      } 
    },
    summary: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      // required: [true, "A tour must have a description"]
    },
    imageCover: {
      type: String,
      requred: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    //каждый раз когда мы трансформируем наш объект в JSON формат виртуальные опции делаем доступными
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// ---------DOC MIDDLEWARE---------------
//documents middleware runs before save() and create() not update
// в данном случае мы получаем возможность внести изменения в промежутке между получением нами ответа от сервера и к нам приходит уже slug полностью lowercase
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre('save', function(next){
//   console.log('will save document');
//   next()
// })

// //post middleware. В doc мы уже имеем финальный документ
// tourSchema.post('save', function(doc,next){
//   console.log(doc)
//   next()
// })

//--------------QUERY MIDDLEWARE----------
//ниже исплользуем не просто find а регулярное выражение , которое говорит, что следующее применимо для всех команд, которые начинаются с find. Нужно это для того, что подобное применялось и для findOne чтобы не писать для этого отдельную функцию.
tourSchema.pre(/^find/, function (next) {
  // tourSchema.pre('find', function(next){
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

// post запускается после завершения query
tourSchema.post(/^find/, function (docs, next) {
  // tourSchema.pre('find', function(next){

  console.log(`Query took ${Date.now() - this.start}`);

  next();
});

// ---------AGGREGATION MIDDDLEWARE---------
tourSchema.pre('aggregate', function (next) {
  console.log(this.pipeline());
  //исключаем секретные туры при аггрегации
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;

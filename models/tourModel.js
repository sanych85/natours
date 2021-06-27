const mongoose = require('mongoose');
const slugify = require('slugify');
const valiadator = require('validator');
// const User = require('./userModel');
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
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium,difficult',
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
      set: (val) => Math.round(val * 10), // Округляем значнения
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
      type: Number,
      validate: {
        message: 'discount price ({VALUE}) should be lower than regular price',
        validator: function (val) {
          //Это возможно только если мы создаем новый документ, а не апдейтим старый. Проблема в this
          return val < this.price;
        },
      },
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
    startLocation: {
      //GeoJSON
      type: {
        type: String,
        default: 'Point',
        //enum'ом задаем все возможные значения, которые могут быть
        enum: ['Point'],
      },
      // ожидаем получить массив чисел.
      coordinates: [Number],
      adress: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        adress: String,
        description: String,
        day: Number,
      },
    ],
    guides: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  }

  //каждый раз когда мы трансформируем наш объект в JSON формат виртуальные опции делаем доступными
  // toJSON: { virtuals: true },
  // toObject: { virtuals: true},
);

//использование indexes (улучшение производительности)
// tourSchema.index({ price: 1, ratingsAverage: -1 });
// tourSchema.index({ slug: 1 });
// tourSchema.index({ startLocation: '2dsphere' });

tourSchema.set('toObject', { virtuals: true });
tourSchema.set('toJSON', { virtuals: true });

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});
tourSchema.virtual('newDuration').get(function () {
  return this.duration / 7;
});

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

//virtual populate.
//В данном случае мы коннектим id нашего тура с полем tours , которые есть в Review

// ---------DOC MIDDLEWARE---------------
//documents middleware runs before save() and create() not update
// в данном случае мы получаем возможность внести изменения в промежутке между получением нами ответа от сервера и к нам приходит уже slug полностью lowercase
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

//Это схема используется как embedding, встраивание
// tourSchema.pre('save', async function (next) {
//   //здесь получим массив промисов
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));

//   //теперь сразу пытаемся резолвнуть эти промисы
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

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

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    //не включаем ниже приведенные поля в вывод
    select: '-__v-passwordChangeAt',
  });
  next();
});

// post запускается после завершения query
tourSchema.post(/^find/, function (docs, next) {
  // tourSchema.pre('find', function(next){

  next();
});

// ---------AGGREGATION MIDDDLEWARE---------
// tourSchema.pre('aggregate', function (next) {
//   //исключаем секретные туры при аггрегации
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;

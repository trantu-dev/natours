const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review must be required']
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    createdAt: {
      type: Date,
      default: Date.now()
    },
    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tour'
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    toObject: {
      virtuals: true
    },
    toJSON: {
      virtuals: true
    }
  }
);

reviewSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name photo'
  });
  next();
});

// GET DOC TO UPDATE IN PRE HOOK
// reviewSchema.pre(/^findOneAnd/, async function(next) {
//   const docToUpdate = await this.model.findOne(this.getQuery());
//   console.log(`🔥 PRE UPDATE: ${docToUpdate}`);
//   next();
// });

reviewSchema.post(/^findOneAnd/, async function(doc, next) {
  // console.log(`🔥 POST UPDATE: ${doc}`);
  await doc.constructor.calRating(doc.tour);
  next();
});
reviewSchema.statics.calRating = async function(tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);
  if (stats.length !== 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].nRating
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: 0,
      ratingsQuantity: 0
    });
  }
};
reviewSchema.post('save', async function(doc, next) {
  await doc.constructor.calRating(doc.tour);
  next();
});
const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;

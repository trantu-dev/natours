const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name must be required'],
      unique: true,
      trim: true,
      maxlength: [40, 'Name maxlength: 40'],
      minlength: [5, 'Name minlength: 5']
      // validate: [validator.isAlpha, 'Name should characters']
    },
    slug: String,
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1.0, 'Rating min 1.0'],
      max: [5.0, 'Rating max 5.0'],
      set: val => Math.round(val * 10) / 10
    },
    secretTour: {
      type: Boolean,
      default: false
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'Price must be required']
    },
    priceDisscount: {
      type: Number,

      validate: {
        // THIS point to current DOCUMENT when create new document, not for updating document
        validator: function(value) {
          return value < this.price;
        },
        message: 'Discount price should below regular price'
      }
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'Summary must be required']
    },
    duration: {
      type: Number,
      required: [true, 'Durations must be required']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'Group size must be required']
    },
    difficulty: {
      type: String,
      required: [true, 'Difficulty must be required'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium or difficul'
      }
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'Image cover must be required']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: [Date],
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    guides: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ]
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

tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });
tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

// virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'tour'
  // count: true
});

// RUN with .save and .create, not .insertMany
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre('save', async function(next) {
//   const guidesPromiseArr = this.guides.map(async id => await User.findById(id));
//   this.guides = await Promise.all(guidesPromiseArr);
//   next();
// });

tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } }).populate({
    path: 'guides',
    select: '-__v'
  });
  next();
});

// tourSchema.pre('aggregate', function(next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   // console.log(this.pipeline());
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;

const crypto = require('crypto');
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Email is invalid']
    },
    photo: {
      type: String,
      default: 'default.jpg'
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'guide', 'lead-guide'],
      default: 'user'
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password min length is 6'],
      select: false
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Password confirm is required'],
      validate: {
        validator: function(val) {
          return this.password === val;
        },
        message: 'Password are not the same'
      }
    },
    passwordChangeAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false
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

userSchema.virtual('bookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'user'
  // count: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  this.password = await bcryptjs.hash(this.password, 8);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangeAt = Date.now() - 1000;
  next();
});
userSchema.pre(/^find/, function(next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.createResetToken = async function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 60 * 10 * 1000;
  await this.save({ validateBeforeSave: false });
  return resetToken;
};
userSchema.methods.changedPasswordAfter = function(JWTTimeStamp) {
  if (!this.passwordChangeAt) return false;

  const changedTimeStamp = parseInt(this.passwordChangeAt.getTime() / 1000, 10);
  return JWTTimeStamp < changedTimeStamp;
};
userSchema.methods.correctPassword = async function(inputPassword, password) {
  return await bcryptjs.compare(inputPassword, password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;

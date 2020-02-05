const express = require('express');
const reviewControlelr = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

const reviewRouter = express.Router({ mergeParams: true });

reviewRouter.use(authController.protect);

reviewRouter
  .route('/')
  .get(reviewControlelr.getAllReviews)
  .post(
    authController.restrictTo('user'),
    reviewControlelr.setUserAndTourId,
    reviewControlelr.createReview
  );
reviewRouter
  .route('/:id')
  .get(reviewControlelr.getReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewControlelr.updateReview
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewControlelr.deleteReview
  );

module.exports = reviewRouter;

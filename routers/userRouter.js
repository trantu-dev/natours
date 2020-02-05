const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const userRouter = express.Router();

userRouter.route('/signup').post(authController.signup);
userRouter.route('/login').post(authController.login);
userRouter.route('/logout').get(authController.logout);
userRouter.route('/forgotPassword').post(authController.forgotPassword);
userRouter
  .route('/resetPassword/:resetToken')
  .patch(authController.resetPassword);

userRouter.use(authController.protect);

userRouter.route('/updatePassword').patch(authController.updatePassword);
userRouter
  .route('/updateMe')
  .patch(userController.uploadUserPhoto, userController.updateMe);
userRouter.route('/me').get(userController.getMe, userController.getUser);
userRouter
  .route('/deleteMe')
  .delete(authController.protect, userController.deleteMe);

userRouter.use(authController.restrictTo('admin'));

userRouter
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
userRouter
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = userRouter;

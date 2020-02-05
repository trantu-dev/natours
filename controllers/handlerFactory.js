const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndDelete(req.params.id);

    if (!document) {
      const err = new AppError('Cant find document with that ID', 404);
      return next(err);
    }
    res.status(204).json({
      status: 'success',
      data: null
    });
  });
exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!document) {
      const err = new AppError('Cant find document with that ID', 404);
      return next(err);
    }
    res.status(200).json({
      status: 'success',
      data: document
    });
  });
exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: newDoc
    });
  });
exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const document = await query;

    if (!document) {
      const err = new AppError(
        'Cant find document with that ID. Please enter another ID.',
        404
      );
      return next(err);
    }
    res.status(200).json({
      status: 'success',
      data: {
        document
      }
    });
  });
exports.getAll = Model =>
  catchAsync(async (req, res, next) => {
    // allow get review on tour
    const filter = {};
    if (req.params.tourId) filter.tour = req.params.tourId;

    const features = new APIFeatures(req.query, Model.find(filter));
    features
      .filter()
      .sort()
      .limitFields()
      .paginate();
    // const documents = await features.query.explain();
    const documents = await features.query;
    res.status(200).json({
      status: 'success',
      results: documents.length,
      documents
    });
  });

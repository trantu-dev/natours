const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();
const app = require('./app');

process.on('uncaughtException', err => {
  console.log(err.name, err.message);
  process.exit(1);
});

const CONN_STR = process.env.CONN_STR.replace(
  '<PASSWORD>',
  process.env.DB_PASSWORD
).replace('<COLLECTION>', process.env.COLLECTION);

// const CONN_STR = process.env.CONN_STR_LOCAL;

mongoose
  .connect(CONN_STR, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => {
    console.log('DB Connection successfully');
  });

const port = +process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on ${port}`);
});

process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// mongoose library
const mongoose = require('mongoose');

module.exports = {
  connect: DB_HOST => {
    // use updated URL string parser
    mongoose.set('useNewUrlParser', true);
    // use findOneAndUpdate() instead of findAndModify()
    mongoose.set('useFindAndModify', false);
    // use createIndex() instead of ensureIndex()
    mongoose.set('useCreateIndex', true);
    mongoose.set('useUnifiedTopology', true);
    // connect with DB
    mongoose.connect(DB_HOST);
    // error loging when connection is failed
    mongoose.connection.on('error', err => {
      console.log(err);
      console.log(
        'MongoDB connection error. Please make sure MongoDB is running'
      );
      process.exit();
    });
  },

  close: () => {
    mongoose.connection.close();
  }
};

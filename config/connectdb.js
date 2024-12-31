const mongoose = require('mongoose');
require('dotenv').config();

const connectDb = async () => { 
  await mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}) };

module.exports = connectDb;
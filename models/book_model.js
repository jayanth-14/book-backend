const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Book Schema
const bookSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    required: true,
    trim: true
  },

  // ISBN: International Standard Book Number
publisher: {
    type: String,
    required: true,
    trim: true
  },
  edition: {
    type: Number,
    default: 1,
    required: true,
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Engineering', 'Diploma', 'Other']
  },
  condition: {
    type: String,
    required: true,
    enum: ['Like New', 'Good', 'Fair', 'Poor']
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  sellerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  image: {
    data: Buffer,
    contentType: String
  },
  status: {
    type: String,
    required: true,
    enum: ['available', 'underNegotiation', 'paymentPending', 'sold'],
    default: 'available'
  },
  viewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

bookSchema.index({ location: '2dsphere' });
bookSchema.index({ title: 'text', author: 'text', description: 'text' });

const bookModel = mongoose.model('books', bookSchema);

module.exports = bookModel;

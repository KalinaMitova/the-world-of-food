const mongoose = require( 'mongoose' );

const CategorySchema = new mongoose.Schema( {
  name: {
    type: mongoose.Schema.Types.String,
    required: true,
    unique: true,
  },
  recipes:[ {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe',
  }],
  imageUrl: {
    type: mongoose.Schema.Types.String,
    required: true
  }
} );

const Category = mongoose.model( 'Category', CategorySchema );

module.exports = Category;

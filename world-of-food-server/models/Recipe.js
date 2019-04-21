const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  title: {
    type: mongoose.Schema.Types.String,
    required: true,
    unique: true,
  },
  ingredients: {
    type: mongoose.Schema.Types.String,
    required: true
  },
  directions:{
    type: mongoose.Schema.Types.String,
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  imageUrl: {
    type: mongoose.Schema.Types.String,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  likes: [
      {
      type: mongoose.Schema.Types.String,
      unique: true,
    }
  ]
});

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;

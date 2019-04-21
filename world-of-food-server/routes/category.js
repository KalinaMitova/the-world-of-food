const express = require('express')
const Category = require('../models/Category');
const Recipe = require('../models/Recipe');
const adminCheck = require('../middleware/admin-check');
const authCheck = require('../middleware/auth-check');

const router = new express.Router()

function validateCategoryForm (payload) {
  const errors = {}
  let isFormValid = true
  let message = ''

  if (!payload || typeof payload.name !== 'string' || payload.name.length < 3) {
    isFormValid = false
    errors.name = 'Category name must be more than 3 symbols.'
  }

  if (!payload || typeof payload.imageUrl !== 'string' ||             payload.imageUrl.trim().length === 0) {
      isFormValid = false
      errors.image = 'Image URL is required.'
    }else{
        if (payload.imageUrl.startsWith('http') < 0) {
                isFormValid = false
                errors.image = 'Image URL must  starts with "http" or "https".'
              }
              if (!(payload.imageUrl.endsWith('jpg') >= 0 || payload.imageUrl.endsWith('png') >= 0)) {
                isFormValid = false
                errors.image = 'Image URL must  ends with "jpg" or "png".'
              }
      }

  if (!isFormValid) {
    message = 'Check the form for errors.'
  }

  return {
    success: isFormValid,
    message,
    errors
  }
}

router.get('/all', (req, res) => {
  Category.find().then((categories) => {
      return res.status(200).json(categories)
  })
})

router.post('/create', authCheck, adminCheck, (req, res) => {
  const category = req.body
  category.recipes = [];
  const validationResult = validateCategoryForm(category)
  if (!validationResult.success) {
    return res.status(400).json({
      success: false,
      message: validationResult.message,
      errors: validationResult.errors
    })
  }

  Category.create(category)
    .then(() => {
      res.status(200).json({
        success: true,
        message: `Category "${category.name}" added successfully.`,
        category: category
      })
    })
})

router.get('/:id', authCheck, (req, res) => {
  const id = req.params.id
  console.log(id)
  Category.findById(id)
    .then((category) => {
      if (!category) {
        return res.status(404).json({
          success: false,
          message: `Category does not exists!`
        })
      }
      res.status(200).json(category)
    }).catch(err =>{
      console.log("error: " + err)
    })
})

router.put('/edit/:id', authCheck, adminCheck, (req, res) => {
  const id = req.params.id;
  const category = req.body;

  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category does not exists!'
    })
  }

  if (!req.user.roles.includes('Admin')) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized!'
    })
  }

  const validationResult = validateCategoryForm(category)
  if (!validationResult.success) {
    return res.status(400).json({
      success: false,
      message: validationResult.message,
      errors: validationResult.errors
    })
  }

  Category.findByIdAndUpdate(id, category)
    .then(() => {
      return res.status(200).json({
        success: true,
        message: 'Category edited successfully!'
      })
  })
})

router.delete('/delete/:id', authCheck, adminCheck, (req, res) => {
  const id = req.params.id
  const user = req.user._id

  Category.findById(id)
    .then((category) => {
      if (!category) {
        return res.status(200).json({
          success: false,
          message: 'Category does not exist!'
        })
      }

      if ( !req.user.roles.includes("Admin")) {
         return res.status(401).json({
           success: false,
           message: 'Unauthorized!'
         })
      }

      Category.findByIdAndDelete(id)
        .then(() => {
          Recipe.update(
            {category: id},
            { $unset: { category: "" } },
            { multi: true }
          ).then(() =>{
             return res.status(200).json({
            success: true,
            message: 'Category deleted successfully!'
            })
          })
        })
    })
})

module.exports = router

const express = require('express')
const authCheck = require('../middleware/auth-check');
const Recipe = require('../models/Recipe');
const Category = require('../models/Category');

const router = new express.Router()

function validateRecipeForm (payload) {
  const errors = {}
  let isFormValid = true
  let message = ''

  if (!payload || typeof payload.title !== 'string' || payload.title.length < 3) {
    isFormValid = false
    errors.make = 'Title must be more than 3 symbols.'
  }

  if (!payload || typeof payload.ingredients !== 'string' || payload.model.length < 3 || /\r|\n/.exec(payload.ingredients)) {
    isFormValid = false
    errors.model = 'Each ingredient must be in a new row!'
  }

  if (!payload || typeof payload.directions !== 'string' || payload.directions.length < 200) {
    isFormValid = false
    errors.year = 'Directions at least 200 symbols.'
  }

  if (!payload || !payload.category) {
    isFormValid = false
    errors.category = 'Category is required!'
  }

  if (payload || typeof payload.imageUrl !== 'string' ) {
      isFormValid = false
      errors.image = 'Image URL must be a string.'
    }else if(payload || typeof payload.imageUrl === 'string'){
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

router.post('/create', authCheck, (req, res) => {
  const recipe = req.body
  recipe.creator = req.user._id
  recipe.likes=[]

  const validationResult = validateRecipeForm(recipe)
  if (!validationResult.success) {
    return res.status(400).json({
      success: false,
      message: validationResult.message,
      errors: validationResult.errors
    })
  }

  Recipe.create(recipe)
    .then(() => {
      Category.update(
        {_id: category.id},
        {$pull:{recipes: recipe.id}}
        )
      .then(()=>{
        res.status(200).json({
        success: true,
        message: 'Recipe added successfully.',
        recipe
      })
      })
    })
})

router.get('/all', authCheck ,(req, res) => {
  const page = parseInt(req.query.page) || 1
  const search = req.query.search

  Recipe.find()
    .then(recipes => {
      return res.status(200).json(recipes)
    })
})

router.get('/details/:id', authCheck, (req, res) => {
  const id = req.params.id
  Recipe.findById(id)
    .then((recipe) => {
      if (!recipe) {
        return res.status(404).json({
          success: false,
          message: 'Entry does not exists!'
        })
      }

      let response = {
        id,
        title: recipe.title,
        ingredients: recipe.ingredients,
        directions: recipe.directions,
        category: recipe.category,
        creator: recipe.creator,
        likes: recipe.likes.count(),
      }

      if (recipe.imageUrl) {
        response.imageUrl = recipe.imageUrl
      }

      res.status(200).json(response)
    })
})

router.get('/user', authCheck, (req, res) => {
  const user = req.user._id

  Recipe.find({creator: user})
    .then((recipes) => {
      return res.status(200).json(recipes)
    })
})

router.delete('/delete/:id', authCheck, (req, res) => {
  const id = req.params.id
  const user = req.user._id

  Recipe.findById(id)
    .then((recipe) => {
      if (!recipe) {
        return res.status(200).json({
          success: false,
          message: 'recipe does not exists!'
        })
      }

      if ((recipe.creator.toString() != user && !req.user.roles.includes("Admin"))) {
         return res.status(401).json({
           success: false,
           message: 'Unauthorized!'
         })
      }

      Recipe.findByIdAndDelete(id)
        .then(() => {
          Category.update(
            {_id: recipe.category},
            {$pull: {resipes: recipe.id}},
            {multy: true}
            )
          return res.status(200).json({
            success: true,
            message: 'Recipe deleted successfully!'
          })
        })
    })
})

router.put('/edit/:id', authCheck, (req, res) => {
  const id = req.params.id;
  const recipe = req.body;

  if (!recipe) {
    return res.status(404).json({
      success: false,
      message: 'Recipe does not exists!'
    })
  }

  if ((recipe.creator.toString() != user && !req.user.roles.includes("Admin"))) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized!'
    })
  }

  const validationResult = validateRecipeForm(recipe)
  if (!validationResult.success) {
    return res.status(400).json({
      success: false,
      message: validationResult.message,
      errors: validationResult.errors
    })
  }

  Recipe.findByIdAndUpdate(id, recipe)
    .then((r) => {
      return res.status(200).json({
        success: true,
        message: 'Recipe edited successfully!',
        recipeNew: recipe,
        recipeAfterUpdate: r
      })
  })
})

// router.get('/:id', authCheck, (req, res) => {
//   const id = req.params.id

//   Recipe.findById(id)
//     .then(recipe => {
//       if (!recipe) {
//         return res.status(404).json({
//           success: false,
//           message: 'Entry does not exists!'
//         })
//       }

//       let response = {
//         id,
//         make: recipe.make,
//         model: recipe.model,
//         year: recipe.year,
//         description: recipe.description,
//         price: recipe.price,
//         image: recipe.image
//       }

//       if (recipe.material) {
//         response.material = recipe.material
//       }

//       res.status(200).json(response)
//     })

    router.post('/like/:id', authCheck, (req, res) => {
  const id = req.params.id
  const username = req.user.username
  Recipe
    .findById(id)
    .then(recipe => {
      if (!recipe) {
        const message = 'Recipe not found.'
        return res.status(200).json({
          success: false,
          message: message
        })
      }

      let likes = recipe.likes
      if (!likes.includes(username)) {
        likes.push(username)
      }
      recipe.likes = likes
      recipe
        .save()
        .then((recipe) => {
          res.status(200).json({
            success: true,
            message: 'Book liked successfully.',
            data: recipe
          })
        })
        .catch((err) => {
          console.log(err)
          const message = 'Something went wrong :('
          return res.status(200).json({
            success: false,
            message: message
          })
        })
    })
    .catch((err) => {
      console.log(err)
      const message = 'Something went wrong :('
      return res.status(200).json({
        success: false,
        message: message
      })
    })
})

router.post('/unlike/:id', authCheck, (req, res) => {
  const id = req.params.id
  const username = req.user.username
  Recipe
    .findById(id)
    .then(recipe => {
      if (!recipe) {
        let message = 'Recipe not found.'
        return res.status(200).json({
          success: false,
          message: message
        })
      }

      let likes = recipe.likes
      if (likes.includes(username)) {
        const index = likes.indexOf(username)
        likes.splice(index, 1)
      }

      recipe.likes = likes
      recipe
        .save()
        .then((recipe) => {
          res.status(200).json({
            success: true,
            message: 'Recipe unliked successfully.',
            data: recipe
          })
        })
        .catch((err) => {
          console.log(err)
          const message = 'Something went wrong :('
          return res.status(200).json({
            success: false,
            message: message
          })
        })
    })
    .catch((err) => {
      console.log(err)
      const message = 'Something went wrong :('
      return res.status(200).json({
        success: false,
        message: message
      })
    })
})


module.exports = router

const express = require('express')
const passport = require('passport')
// const validator = require('validator')

const router = new express.Router()

function validateSignupForm (payload) {
  const errors = {}
  let isFormValid = true
  let message = ''

  if (!payload || typeof payload.username !== 'string' || payload.username.trim() .length< 4) {
    isFormValid = false
    errors.username = 'Username must have at least 4 characters.'
  }

  if (!payload || typeof payload.password !== 'string' || payload.password.trim().length < 6) {
    isFormValid = false
    errors.password = 'Password must have at least 6 characters.'
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

function validateLoginForm (payload) {
  const errors = {}
  let isFormValid = true
  let message = ''

 if (!payload || typeof payload.username !== 'string' || payload.username.trim().length < 4) {
    isFormValid = false
    errors.username = 'Username must have at least 4 characters.'
  }

  if (!payload || typeof payload.password !== 'string' || payload.password.trim().length === 0) {
    isFormValid = false
    errors.password = 'Please provide your password.'
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

function LogIn(req,res,next){
  passport.authenticate('local-login', (err, token, userData) => {
    if (err) {
      if (err.username === 'IncorrectCredentialsError') {
        console.log('Invalid credentials');
        return res.status(401).json({
          success: false,
          message: err.message
        })
      }

      return res.status(401).json({
        success: false,
        message: 'Could not process the form.'
      })
    }

    return res.json({
      success: true,
      message: 'You have successfully logged in!',
      token,
      user: userData
    })
  })(req, res, next)
}

router.post('/register', (req, res, next) => {
  const validationResult = validateSignupForm(req.body)
  if (!validationResult.success) {
    return res.status(401).json({
      success: false,
      message: validationResult.message,
      errors: validationResult.errors
    })
  }

    passport.authenticate('local-signup', (err) => {
    if (err) {
      if(err.username === 'DuplicateUsername'){
        return res.status(401).json({
        success: false,
        message: err.message
        })
      }

      return res.status(401).json({
        success: false,
        message: err
      })
    };

    // LogIn(req,res,next);

    return res.status(200).json({
      success: true,
      message: 'You have successfully registered! Now you should be able to log in.'
    })

  })(req, res, next)

})

router.post('/login', (req, res, next) => {
  const validationResult = validateLoginForm(req.body)
  if (!validationResult.success) {
    return res.status(401).json({
      success: false,
      message: validationResult.message,
      errors: validationResult.errors
    })
  }

  LogIn(req,res,next);
})

module.exports = router

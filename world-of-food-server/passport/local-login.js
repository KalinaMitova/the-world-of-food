const jwt = require('jsonwebtoken')
const PassportLocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');
const encryption = require('../util/encryption');

module.exports = new PassportLocalStrategy({
  usernameField: 'username',
  passwordField: 'password',
  session: false,
  passReqToCallback: true
}, (req, username, password, done) => {
  const user = {
    username: username.trim(),
    password: password.trim()
  }

  User.findOne({username: user.username}).then((savedUser) => {
    if (!savedUser) {
      const error = new Error('Incorrect username or password')
      error.username = 'IncorrectCredentialsError'

      return done(error)
    }

    const isMatch = savedUser.hashedPass === encryption.generateHashedPassword(savedUser.salt, password);

    if (!isMatch) {
      const error = new Error('Incorrect username or password')
      error.username = 'IncorrectCredentialsError'

      return done(error)
    }

    const payload = {
      sub: savedUser.id
    }

    // create a token string
    const token = jwt.sign(payload, 's0m3 r4nd0m str1ng');
    const isAdmin = savedUser.roles.indexOf('Admin') != -1;
    const data = {
      username: savedUser.username,
      isAdmin
    }

    return done(null, token, data)
  })
})

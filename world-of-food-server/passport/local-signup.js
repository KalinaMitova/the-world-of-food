const PassportLocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');
const encryption = require('../util/encryption');

module.exports = new PassportLocalStrategy({
  usernameField: 'username',
  passwordField: 'password',
  session: false,
  passReqToCallback: true
}, (req, username, password, done) => {
  const salt = encryption.generateSalt();
  const hashedPass = encryption.generateHashedPassword(salt, password);
  User.create({username, hashedPass, salt})
  .then(() => {
    return done(null);
  })
  .catch(err=>{
    if(err.code === 11000){
      const error = new Error(`The username "${username}" already exists. Please choose another one.`);
      error.username = `DuplicateUsername`;
      return done(error);
    }
  })
})

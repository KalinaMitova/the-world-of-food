module.exports = (req, res, next) => {
  console.log(req.user);
  if (!req.user) {
    return res.status(401).end()
  }
  if(req.user.roles.indexOf('Admin') > -1){
    return next();
  }else{
    return res.status(401).end()
  }
}

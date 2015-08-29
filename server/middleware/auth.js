module.exports = function(req, res, next) {
  if (req.session && req.session.user) {
    next();
  } else {
    res.redirect('/login');
    //res.status(401).end()
  }
}
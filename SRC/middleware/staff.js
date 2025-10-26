function staff(req, res, next){
  const role = req.user.user.role;
  if (role === 'customer' || role === undefined ){
    return res.status(403).json({ msg: 'Access denied'});
  }
  next();
}

module.exports = staff;
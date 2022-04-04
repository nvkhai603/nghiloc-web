var router = require('express').Router();

router.use('/tenants', require('./tenant'));
router.use('/admins', require('./admin'));
router.use('/exams', require('./exam'));
router.use('/user-exams', require('./user-exam'));
router.use('/directories', require('./directory'));
router.use('/organizations', require('./organization'));
router.use(function(err, req, res, next){
  if(err.name === 'ValidationError'){
    return res.status(422).json({
      errors: Object.keys(err.errors).reduce(function(errors, key){
        errors[key] = err.errors[key].message;

        return errors;
      }, {})
    });
  }

  return next(err);
});

module.exports = router;
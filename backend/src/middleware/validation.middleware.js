const { body, validationResult } = require('express-validator');

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));
    
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    
    res.status(400).json({
      status: 'error',
      errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
    });
  };
};

const postRules = [
  body('title').notEmpty().withMessage('Title is required').isLength({ max: 200 }),
  body('content').notEmpty().withMessage('Content is required').isLength({ min: 10 }),
  body('tags').optional()
];

const commentRules = [
  body('content').notEmpty().withMessage('Comment cannot be empty').isLength({ max: 1000 })
];

const userRules = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').notEmpty().withMessage('Name is required')
];

module.exports = {
  validate,
  validatePost: validate(postRules),
  validateComment: validate(commentRules),
  validateUser: validate(userRules)
};
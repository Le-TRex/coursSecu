const express = require('express')
const { body, validationResult } = require('express-validator')

const app = express()

app.use(express.json())

app.all('/', (req, res) => {
  if (req.method === 'GET') {
    return res.send('hello world')
  }
  res.status(405).send('Method not allowed')
})

const handleErrorsOrDisplayBody = (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  return res.send({ status: 'valid!', data: req.body })
}

app.post(
  '/validate-different',
  body('username')
    .not().isEmpty().withMessage('username is missing')
    .isEmail().withMessage('should be an email'),
  body('password').isLength({ min: 8, max: 50 }).optional(),
  handleErrorsOrDisplayBody
)

app.post('/validate-person',
  body('firstname').isLength({ min: 5, max: 29 }),
  body('lastname').isLength({ min: 5, max: 14 }),
  body('age').isInt({ min: 18, max: 120 }),
  body('personal-website').isURL({ protocols: ['http', 'https'] }).optional(),
  handleErrorsOrDisplayBody
)

app.post('/validate-contact',
  body('phone').isMobilePhone('fr-FR'),
  body('description')
    .trim()
    .not().isEmpty()
    .isLength({ max: 200 }),
  body('type').equals('contact'),
  handleErrorsOrDisplayBody
)

app.post('/validate-register',
  body('email')
    .isEmail()
    .normalizeEmail()
    .customSanitizer(value => {
      const re = /\+.*@/
      return value.replace(re, '@')
    }),
  body('password')
    .isLength({ min: 9 }).withMessage('should be longer than 8 characters')
    .isLength({ max: 49 }).withMessage('should be shorter than 50 characters')
    .matches(/[A-Z]/).withMessage('should contain at least one uppercase character')
    .matches(/[a-z]/).withMessage('should contain at least one lowercase character')
    .matches(/[0-9]/).withMessage('should contain at least one number')
    .matches(/[&$@!?]/).withMessage('should contain at least one special character (&, $, @, ! or ?)'),
  body('confirm-password').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('does not match password')
    }
    return true
  }),
  handleErrorsOrDisplayBody
)

module.exports = app

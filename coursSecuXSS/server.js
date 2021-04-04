const express = require('express')
const mustacheExpress = require('mustache-express')
const cookieParser = require('cookie-parser')
const escape = require('escape-html')

// Instanciate an express.js application
const app = express()
const port = 3000

// Configure mustache as the main views engine
app.engine('mustache', mustacheExpress())
app.set('view engine', 'mustache')
app.set('views', __dirname + '/views')

// Allows to parse request cookies
app.use(cookieParser())

// The homepage
app.get('/', (req, res) => {
  // Gets title and message from query parameters
  const title = escape(req.query.title)
  const message = escape(req.query.message)
  // Sets a cookie
  res.cookie('myCookie', 'notsosecuredcookie')
  // Render the ./views/welcome.mustache view with properties
  res.render('welcome.mustache', { title, message })
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

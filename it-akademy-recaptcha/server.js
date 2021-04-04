
const express = require('express')
const mustacheExpress = require('mustache-express')
const bodyParser = require('body-parser')
const axios = require('axios').default

//const SITE_KEY = process.env.SITE_KEY si la key est présente dans les variables d'environnement = dans le .env
const SITE_KEY = '6LcWr3kaAAAAAPDCRIAs2SUyxSBTjAHihyM5VrNQ'
const SECRET_KEY = '6LcWr3kaAAAAAIh-_gJwmivZRFZAXbBHETrjF6Vi'

// Instanciate an express.js application
const app = express()
const port = 3000

// Configure mustache as the main views engine
app.engine('mustache', mustacheExpress())
app.set('view engine', 'mustache')
app.set('views', __dirname + '/views')

// Allows to parse the body of incoming requests
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Create a "in-memory" simple database
const Datastore = require('nedb')
const db = new Datastore()

// Insert data into the database
db.insert({ name: 'Marty McFly' })
db.insert({ name: 'Doc Brown' })

// The homepage
app.get('/', (req, res) => {
  // Look for all items in the database
  db.find({}, function (err, docs) {
    // Here docs looks like something like this:  [ { name: 'John Doe', _id: 'foobar' }, name: 'Marty McFly', _id: 'foobaz' }]
    // Render the ./views/petition.mustache view with properties
    res.render('petition.mustache', { signers: docs.map(({ name }) => name), siteKey: SITE_KEY } )
  })
})

// The form submit endpoint
app.post('/sign', (req, res) => {
  axios.post('https://www.google.com/recaptcha/api/siteverify', {},{
    params: {
      secret : SECRET_KEY,
      response : req.body['g-recaptcha-response']
    }
  })
    .then((response) => {
      if (response.data.success) {
        // Add  the signers into the database
        db.insert({ name: req.body.name })
        // Redirect to the homepage
        return res.redirect('/')
      }
      return res.status(400).send('error')
    })
    .catch(() => {
      return res.status(400).send('error')
    })
})

// Launch the application and listen to port 3000
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

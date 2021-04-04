
const express = require('express')
const mustacheExpress = require('mustache-express')
const bodyParser = require('body-parser')
const escape = require('escape-html')

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
    res.render('petition.mustache', { signers: docs.map(({ name }) => name) } )
  })
})

// The form submit endpoint
app.post('/sign', (req, res) => {
  // Add  the signers into the database
      //SOLUTION 1
  //Escape que le name
  //req.body.name=escape(req.body.name)
  //db.insert(req.body)

      //SOLUTION 2
  //permet d'escaper tous les paramètres de la requête s'il y en a plusieurs
  const signer = {name: escape(req.body.name)}
  db.insert(signer)
  // Redirect to the homepage
  res.redirect('/')
})

// Launch the application and listen to port 3000
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

const express = require('express')
const mustacheExpress = require('mustache-express')
const bodyParser = require('body-parser')
const sqlite3 = require('sqlite3').verbose()

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

// Create a "in-memory" SQL database
const db = new sqlite3.Database(':memory:')

// Insert data into the database
db.serialize(() => {
  db.run('CREATE TABLE signers (Name varchar(255), Anonymous int)')
  db.run('INSERT INTO signers (Name, Anonymous) VALUES (\'Marty McFly\', 0)')
  db.run('INSERT INTO signers (Name, Anonymous) VALUES (\'Doc Brown\', 0)')
  db.run('INSERT INTO signers (Name, Anonymous) VALUES (\'Madonna\', 1)')
  db.run('INSERT INTO signers (Name, Anonymous) VALUES (\'Jay-Z\', 1)')
})

// The homepage
app.get('/', (req, res) => {
  // Define a default value for the name search parameter
  const nameSearch = req.query.name ? req.query.name : '%'

  // Look for all signers in the database
  db.all('SELECT Name, Anonymous FROM signers', (err, rows) => {
    console.log(rows)
  })

  // Look for anonymous signers by their names in the database

  //Si on tape : http://localhost:3000/?name=Marty dans le navigateur, on obtient bien Marty McFly
  //Par contre si on tape : http://localhost:3000/?name=%27%20OR%20Anonymous%20NOT%20NULL;-- on ne peut plus obtenir les
  //signataires qui ont choisi d'être anonymisés
  db.all('SELECT Name FROM signers WHERE Anonymous = 0 AND Name LIKE \'%\' || ? || \'%\'', nameSearch, (err, rows) => {
    // Here rows looks like something like this: [{ Name: 'Marty McFly' }, { Name: 'Doc Brown' }]
    if (err) {
      res.send('error')
    }
    // Render the ./views/petition.mustache view with properties
    res.render('petition.mustache', { signers: rows.map(({ Name }) => Name) } )
  })
})

// The form submit endpoint
app.post('/sign', (req, res) => {
  // Insert data into the database
  //const query = `INSERT INTO signers (Name, Anonymous) VALUES ( Name = ?, Anonymous = ? ), ['${req.body.name}', ${req.body.anonymous ? 1 : 0}])`
  //db.exec(query)

  //empêche l'execution de script dans l'input de type : OOPS', 0); DELETE FROM signers;-- qui provoquerait une suppression
  //de données
  db.run(`INSERT INTO signers (Name, Anonymous) VALUES ( ?, ? )`, [`${req.body.name}`, `${req.body.anonymous ? 1 : 0}`])
  // Redirect to the homepage
  res.redirect('/')
})

// Launch the application and listen to port 3000
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

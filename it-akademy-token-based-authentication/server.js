const express = require('express')
const mustacheExpress = require('mustache-express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const cookieSession = require('cookie-session')
const flash = require('connect-flash')
const passport = require('passport')
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt')
const LocalStrategy = require('passport-local').Strategy
const Datastore = require('nedb')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const app = express()
const port = 3000

app.engine('mustache', mustacheExpress())
app.set('view engine', 'mustache')
app.set('views', __dirname + '/views')

app.use(cookieParser())
app.use(cookieSession({
  name: 'session',
  keys: ['cats'],
  maxAge: 24 * 60 * 60 * 1000
}))
app.use(flash())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(passport.initialize())

const db = new Datastore()

const SECRET_KEY = 'i-am-very-secret'

const users = [
  { username: 'marty', clearPassword: 'i-love-hoverboards', email: 'marty.mcfly@hill-valley.com' },
  { username: 'doc', clearPassword: 'einstein', email: 'mad-scientisty@hill-valley.com' }
]

users.forEach((user, index) => {
  const { clearPassword, ...other } = user
  const hashedPassword = bcrypt.hashSync(clearPassword, 10)
  db.insert({ id: index, hashedPassword, connexions: 0, tokenUsage: 0, ...other })
})

passport.use(new LocalStrategy(
  (username, password, done) => {
    console.log(`Looking for user ${username}`)
    db.findOne({ username }, (error, user) => {
      if (error) return done(error)
      if (!user || !bcrypt.compareSync(password, user.hashedPassword)) return done(null, false)

      console.log(`Found him: ${JSON.stringify(user)}`)
      const { id, username, email } = user
      let { connexions } = user
      connexions += 1

      const tokenUsage = 0
      db.update({ id }, { $set: { connexions, tokenUsage } })

      console.log(`Authenticating user ${username}`)
      return done(null, { id, username, email, connexions, tokenUsage })
    })
  }
))

const jwtStrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: SECRET_KEY
}

passport.use(new JwtStrategy(jwtStrategyOptions, (jwtPayload, done) => {
  console.log(`Looking for user with id ${jwtPayload.sub}`)
  db.findOne({ id: jwtPayload.sub }, (error, user) => {
    console.log(`Found user: ${JSON.stringify(user)}`)
    if (error) return done(error)
    if (!user) return done(null, false)

    const { id, username, email, connexions } = user
    let { tokenUsage } = user
    tokenUsage += 1

    db.update({ id }, { $set: { tokenUsage } })
   
    console.log(`Authenticating user ${username}`)
    return done(null, { id, username, email, connexions, tokenUsage })
  })
}))

app.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.send(req.user)
})

app.post('/login',
  passport.authenticate('local', { session: false }),
  (req, res) => {
    const token = jwt.sign({ sub: req.user.id }, SECRET_KEY)
    res.send({ token })
  }
)

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

const express = require('express')
const mustacheExpress = require('mustache-express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const cookieSession = require('cookie-session')
const flash = require('connect-flash')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const Datastore = require('nedb')
const csrf = require('csurf')
const bcrypt = require('bcrypt')
const moment = require('moment')

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
app.use(passport.session())
app.use(csrf())

const db = new Datastore()

const users = [
  { username: 'marty', clearPassword: 'i-love-hoverboards', email: 'marty.mcfly@hill-valley.com' },
  { username: 'doc', clearPassword: 'einstein', email: 'mad-scientisty@hill-valley.com' }
]

users.forEach((user, index) => {
  const { clearPassword, ...other } = user
  //...other 'stocke' toutes les autres informations de user : username, email
  const hashedPassword = bcrypt.hashSync(clearPassword, 10)
  db.insert({ id: index, hashedPassword, connexions: 0, ...other })
})

passport.use(new LocalStrategy(
  (username, password, done) => {
    console.log(`Looking for user ${username}`)
    db.findOne({ username }, (error, user) => {
      console.log(`Found him: ${JSON.stringify(user)}`)
      if (error) {
        console.log('Error')
        return done(error)
      }
      if (!user || !bcrypt.compareSync(password, user.hashedPassword)) {
        console.log('Error with credentials')
        return done(null, false)
      }


      //const { id, username, email } = user
      //let { connexions } = user
      //connexions += 1

      //db.update({ id }, { $set: { connexions } })
      

      user.connexions+=1
      db.update({ id: user.id }, { $set: { connexions: user.connexions } }, () => {
      })

      const { id, username, email, connexions } = user

      console.log(`Authenticating user ${username}`)
      return done(null, { id, username, email, connexions })
    })
  }
))

passport.serializeUser((user, done) => {
  done(null, user)
})

passport.deserializeUser((user, done) => {
  db.findOne({ id: user.id }, (error, user) => {
    if (error || !user) {
      return done(error)
    }

    const { id, username, email, connexions } = user
    return done(null, { id, username, email, connexions })
  })
})

const isConnected = req => req.session.passport && req.session.passport.user

const redirectIfAnonymous = (req, res, next) => {
  if (!isConnected(req)) {
    res.redirect('/login')
  } else {
    next()
  }
}

const redirectIfConnect = (req, res, next) => {
  if (isConnected(req)) {
    res.redirect('/')
  } else {
    next()
  }
}

app.use((req, res, next) => {
  if (!req.session.startTime) {
    req.session.startTime = moment()
  }
  if (moment.isMoment(req.session.startTime)) {
    req.session.startTime = moment(req.session.startTime)
  }
  next()
})

app.get('/', redirectIfAnonymous, (req, res) => {
  const duration = moment.duration(moment().diff(req.session.startTime))
  const { user } = req.session.passport
  res.render('account.mustache', { user, duration: duration.as('seconds') })
})

app.get('/logout', (req, res) => {
  req.session = null
  res.redirect('/login')
})

app.get('/login', redirectIfConnect, (req, res) => {
  res.render('login.mustache', { flash: req.flash('error'), csrfToken: req.csrfToken() } )
})

app.post('/login',
  (req, res, next) => {
    // That is dangerous and should never be done, shame on you
    console.log(`Trying to authenticate with following credentials: ${req.body.username} ${req.body.password}`)
    next()
  },
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  })
)

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

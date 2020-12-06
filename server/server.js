// load environment variables
require('dotenv').config()

// import stuff
const express = require('express')
const app     = express()
const path    = require('path')
const charset = require('./charset')
const cors    = require('./cors')
const auth    = require('./auth')
const logit   = require('./logit')
const error   = require('http-errors')
const jwt     = require('jwt-simple')

// get movie collection
const movies = require('mowr')(process.env.MOVIEDB).get('movies')

// use json parser
app.use(express.json())

// set paths
app.use(express.static(path.join(__dirname, '/')))
app.use(express.static(path.join(__dirname, '/../')))
app.use(express.static(path.join(__dirname, '/../dist/')))

app.use(charset)
app.use(cors)
app.use(auth)

// set secret string
app.set('jwtsecret', process.env.JWTSECRET)

// figure out user-agent
const useragent = (str, arr = str.split(' ').reverse()) => {
  if (arr[0].includes(')')) arr = arr.slice(1)
  if (arr[0].includes('(')) arr = arr.slice(1)

  return (
    str.includes('OPR/') || str.includes('Gecko/') || str.includes('Edg/') ? arr[0] : // opera, firefox, edge
    str.includes('Chrome') ? arr[1] : // chrome
    str.includes('Gecko)') ? arr[0] : // safari
    str
  )
}

// routes
app.get('/', (req, res) => res.sendFile('index.html'))

app.post('/login', (req, res, next) => {
  const role = req.body.pass === process.env.READ ? 'read' : req.body.pass === process.env.EDIT ? 'edit' : undefined

  if (role) {
    // token expires after 1 day
    const token = jwt.encode({
      exp: Date.now() + (1 * 24 * 60 * 60 * 1000),
      role
    }, app.get('jwtsecret'))
    logit(`Someone logged in as [${role}] - ${useragent(req.headers['user-agent'])}`)
    res.json({token, role})
  }
  else next(error(401, `Inloggen mislukt`))
})

app.get('/all', (req, res, next) => {
  movies.find()
  .then(list => res.json({list, omdb: process.env.OMDB}))
  .catch(next)
})

app.post('/', (req, res, next) => {
  if (req.role === 'edit') {
    if (req.body && req.body.title) {
      movies.insertOne(req.body)
      .then(x => res.json(x), logit(`POST --> ${req.body.title} [${req.role}] - ${useragent(req.headers['user-agent'])}`))
      .catch(next)
    }
    else logit('error post...req.headers:', req.headers)
  }
  else next(error(403, 'You cannot pass! I am a servant of the Secret Fire, wielder of the flame of Anor. The dark fire will not avail you, flame of Udûn. Go back to the Shadow! YOU! SHALL NOT! PASS!'))
})

app.put('/:id', (req, res, next) => {
  if (req.role === 'edit' || req.query.update) {
    if (req.body && req.params.id) {
      movies.updateOne(req.params.id, {$set: req.body})
      .then(x => res.json(x), logit(`${req.query.update ? 'a' : ''}PUT --> ${req.body.title} [${req.role}] - ${useragent(req.headers['user-agent'])}`))
      .catch(next)
    }
    else logit('error put...req.headers:', req.headers)
  }
  else next(error(403, 'You cannot pass! I am a servant of the Secret Fire, wielder of the flame of Anor. The dark fire will not avail you, flame of Udûn. Go back to the Shadow! YOU! SHALL NOT! PASS!'))
})

app.delete('/:id/:title', (req, res, next) => {
  if (req.role === 'edit') {
    if (req.params.id && req.params.title) {
      movies.deleteOne(req.params.id)
      .then(() => res.json(true), logit(`DELETE --> ${req.params.title} [${req.role}] - ${useragent(req.headers['user-agent'])}`))
      .catch(next)
    }
    else logit('error delete...req.headers:', req.headers)
  }
  else next(error(403, 'You cannot pass! I am a servant of the Secret Fire, wielder of the flame of Anor. The dark fire will not avail you, flame of Udûn. Go back to the Shadow! YOU! SHALL NOT! PASS!'))
})

// error handler
app.use((err, req, res, next) => {
  logit(`(${err.statusCode}) ${err}`)
  if (!(err.statusCode === 401 || err.statusCode === 403)) logit(err)
  
  if (!err.statusCode) err.statusCode = 500
  res.status(err.statusCode).json(err)
})

// start server
app.listen(11188, () => {
  logit(`Oscar's small Movie app is listening at port 11188`)
})

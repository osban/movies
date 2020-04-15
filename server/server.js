// load environment variables
require('dotenv').config()

// import stuff
const express    = require('express')
const app        = express()
const path       = require('path')
const bodyparser = require('body-parser')
const logit      = require('./logit')

// connect to database
const db = require('mowr')(process.env.MOVIEDB_URI)

// get movie collection
const movies = db.get('movies')

// create application/json parser
app.use(bodyparser.json())

// enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS')
  next()
})

// set path
app.use(express.static(path.join(__dirname, '/')))
app.use(express.static(path.join(__dirname, '/../')))
app.use(express.static(path.join(__dirname, '/../dist/')))

// routes
app.get('/', (req, res) => {
  res.sendFile('index.html')
})

app.get('/get', (req, res, next) => {
  movies.find()
  .then(list => res.json({list, omdb: process.env.OMDB}))
  .catch(next)
})

app.post('/post', (req, res, next) => {
  movies.insertOne(req.body)
  .then(x => res.json(x), logit(`POST --> ${req.body.title}`))
  .catch(next)
})

app.put('/put/:id', (req, res, next) => {
  movies.updateOne(req.params.id, req.body)
  .then(x => res.json(x), logit(`PUT --> ${req.body.title}`))
  .catch(next)
})

app.delete('/del/:id/:title', (req, res, next) => {
  movies.deleteOne(req.params.id)
  .then(() => res.json(true), logit(`DELETE --> ${req.params.title}`))
  .catch(next)
})

// error handler
app.use((err, req, res, next) => {
  logit(err)
  if (!err.statusCode) err.statusCode = 500
  res.status(err.statusCode).json(err)
})

// start server
app.listen(8088, () => {
  logit(`Oscar's small Movie app is listening at port 8088`)
})

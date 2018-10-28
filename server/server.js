// load environment variables
require('dotenv').config()

// import stuff
const express    = require('express')
const app        = express()
const path       = require('path')
const bodyparser = require('body-parser')

// connect to database
const db = require('monk')(process.env.MOVIEDB_URI)
db.then(() => console.log(`Success! Connected to Oscar's small Movie Database :)`))
db.catch(err => console.log(`Failure! ${err} :(`))

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
  movies.find({})
  .then(items => res.json({list: items, omdb: process.env.OMDB}))
  .catch(next)
})

app.post('/post', (req, res, next) => {
  movies.insert(req.body)
  .then(x => res.json(x), console.log(`POST --> ${req.body.title}`))
  .catch(next)
})

app.put('/put/:id', (req, res, next) => {
  movies.update(req.params.id, req.body)
  .then(x => res.json(x), console.log(`PUT --> ${req.body.title}`))
  .catch(next)
})

app.delete('/del/:id/:title', (req, res, next) => {
  movies.remove(req.params.id)
  .then(() => res.json(true), console.log(`DELETE --> ${req.params.title}`))
  .catch(next)
})

// error handler
app.use((err, req, res, next) => {
  console.log(err)
  if (!err.statusCode) err.statusCode = 500
  res.status(err.statusCode).json(err)
})

// start server
app.listen(8088, () => {
  console.log(`Oscar's small Movie app is listening at port 8088`)
})

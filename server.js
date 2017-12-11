// load environment variables
require('dotenv').config()

// import stuff
const express = require('express')
const app = express()
const path = require('path')
const compression = require('compression')
const bodyParser = require('body-parser')

const port = process.env.PORT || 8088

// GZIP all assets
app.use(compression())

// connect to database
const db = require('monk')(process.env.MOVIEDB_URI)
db.then(() => console.log("Success! Connected to Oscar's small Movie Database :)"))
db.catch(err => console.log("Failure! " + err + " :("))

// create application/json parser
app.use(bodyParser.json())

// get movie collection
const movies = db.get('movies')

// enable CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS")
  next()
})

// set path
app.use(express.static(path.join(__dirname, '/')))

// routes
app.get('/', (req, res) => {
  res.sendFile('index.html')
})

app.get('/getall', (req, res) => {
  movies.find({})
  .then(items => res.send({list: items, omdbapi: process.env.OMDBAPI}))
  .catch(err => res.send(err))
})

app.post('/post', (req, res) => {
  movies.insert(req.body)
  .then(x => res.send(x), console.log("POST successful"))
  .catch(err => res.send(err))
})

app.put('/put/:id', (req, res) => {
  movies.update(req.params.id, req.body)
  .then(x => res.send(x), console.log("PUT successful"))
  .catch(err => res.send(err))
})

app.delete('/delete/:id', (req, res) => {
  movies.remove(req.params.id)
  .then(x => res.send(x), console.log("DELETE successful"))
  .catch(err => res.send(err))
})

// start server
app.listen(port, () => {
  console.log(`Oscar's small imdb app is listening at port ${port}`)
})

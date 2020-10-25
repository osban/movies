const app = require('express')()
const jwt = require('jwt-simple')

// set secret string
app.set('jwtsecret', process.env.JWTSECRET)

// check token
const checktoken = token => {
  try {
    if (token === 'notok') return 'OK' // login screens
    const decoded = jwt.decode(token, app.get('jwtsecret'))
    if (decoded.exp <= Date.now()) return 'Token verlopen'
    else return decoded.role
  }
  // token isn't validated
  catch (err) {
    return 'Invalid token'
  }
}

const auth = (req, res, next) => {
  if (req.headers['movtok']) {
    const check = checktoken(req.headers['movtok'])
    if (check !== 'Token verlopen' && check !== 'Invalid token') {
      if (check !== 'OK') req.role = check
      next()
    }
    else res.status(401).json('Invalid token')
  }
  else res.status(401).json('Invalid access')
}

module.exports = auth
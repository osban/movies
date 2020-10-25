module.exports = (req, res, next) => {
  res.setHeader('charset', 'utf-8')
  next()
}
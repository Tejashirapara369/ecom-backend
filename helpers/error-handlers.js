function errorHandler(err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    return res.status(401).send('unauthorised user!')
  }
  if (err.name === 'ValidationError') {
    return res.status(401).send(err)
  }
  return res.status(500).json({ error: err })
}

module.exports = errorHandler

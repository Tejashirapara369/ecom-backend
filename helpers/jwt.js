const { expressjwt: jwt } = require('express-jwt')

function authJwt() {
  const secret = process.env.SECRET_KEY
  const apiUrl = process.env.API_URL

  return jwt({
    secret,
    algorithms: ['HS256'],
    isRevoked: isRevoked,
  }).unless({
    path: [
      { url: /\/api\/v1\/product(.*)/, methods: ['GET', 'OPTIONS'] },
      { url: /\/api\/v1\/categories(.*)/, methods: ['GET', 'OPTIONS'] },
      `${apiUrl}/users/login`,
      `${apiUrl}/users/register`,
    ],
  })
}

async function isRevoked(req, { payload }) {
  return !payload.isAdmin
}

module.exports = authJwt

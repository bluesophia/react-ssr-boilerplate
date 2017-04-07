const express = require('express')
const router = express.Router()
const passport = require('passport')
const jwt = require('jsonwebtoken')
const secret = process.env.JWT_SECRET || require('../../config.json').jwtSecret

/**
 * '/api/login/local'
 *
 * Handles a local authentication request. If successful, a JWT is returned
 * to the client.
 */
router.post('/local', (req, res, next) => {
  passport.authenticate('local-login', (err, user, info) => {
    if (err) {
      console.error('login.js: local-login failed', err)
      return res.status(500).json({
        errors: {
          server: 'A server error occurred',
          error: err
        }
      })
    }

    if (!user) {
      // info will contain { message: 'Invalid login credentials' }
      return res.status(401).json(info)
    }

    const token = createToken(user)

    return res.json({ token })
  })(req, res, next)
})

/**
 * '/api/login/github'
 *
 * Handles a GitHub OAuth request. If successful, a JWT is returned
 * to the client.
 */
router.get('/github', (req, res, next) => {
  passport.authenticate('login-github', (err, user) => {
    if (err) {
      console.error('login.js: login-github failed', err)
      return res.status(500).json({
        errors: {
          server: 'A server error occurred',
          error: err
        }
      })
    }

    if (!user) {
      return res.status(401).json({ message: 'Login failed', user })
    }

    const token = createToken(user)
    return res.json({ token })
  })(req, res, next)
})

function createToken (user) {
  return jwt.sign({
    sub: user._id,
    username: user.username
  }, secret, {
    expiresIn: '3h'
  })
}

module.exports = router

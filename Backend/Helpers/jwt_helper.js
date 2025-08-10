const JWT = require('jsonwebtoken')
const createError = require('http-errors')
const User = require('../Models/Auth.model')
const mongoose = require('mongoose')

// Validate environment variables on startup
const validateEnvVars = () => {
  const requiredVars = [
    'ACCESS_TOKEN_SECRET',
    'REFRESH_TOKEN_SECRET',
    'DOMAIN'
  ]
  
  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      throw new Error(`Missing required environment variable: ${varName}`)
    }
  })
}

// Call validation
try {
  validateEnvVars()
} catch (err) {
  console.error('Environment configuration error:', err.message)
  process.exit(1)
}

module.exports = {
  signAccessToken: (userId) => {
    return new Promise((resolve, reject) => {
      if (!userId) {
        return reject(createError.BadRequest('User ID is required'))
      }

      const payload = {
        iss: process.env.DOMAIN,
        aud: userId.toString(),
        iat: Math.floor(Date.now() / 1000)
      }

      const options = {
        expiresIn: '30d',
        algorithm: 'HS256'
      }

      JWT.sign(payload, process.env.ACCESS_TOKEN_SECRET, options, (err, token) => {
        if (err) {
          console.error('JWT signing error:', err)
          return reject(createError.InternalServerError('Token generation failed'))
        }
        resolve(token)
      })
    })
  },

  verifyAccessToken: (req, res, next) => {
  try {
    let token = req.headers.token ||
      (req.headers.authorization && req.headers.authorization.split(' ')[1]);

    if (!token) {
      return next(createError.Unauthorized('Access token is required'));
    }

    JWT.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, payload) => {
      if (err) {
        const message =
          err.name === 'JsonWebTokenError'
            ? 'Invalid token'
            : err.message === 'jwt expired'
            ? 'Token expired'
            : err.message;
        return next(createError.Unauthorized(message));
      }

      try {
        // Ensure payload.aud is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(payload.aud)) {
          return next(createError.Unauthorized('Invalid user ID in token'));
        }

        const user = await User.findById(payload.aud).select('-password');

        if (!user) {
          return next(createError.Unauthorized('User not found'));
        }

        req.user = user;
        req.payload = payload;
        next();
      } catch (dbError) {
        console.error('Database error during token verification:', dbError.message);
        return next(createError.InternalServerError('Database query failed during authentication'));
      }
    });
  } catch (error) {
    console.error('Unexpected error in verifyAccessToken:', error.message);
    next(createError.InternalServerError('Internal server error during authentication'));
  }
}
,

  signRefreshToken: (userId) => {
    return new Promise((resolve, reject) => {
      if (!userId) {
        return reject(createError.BadRequest('User ID is required'))
      }

      const payload = {
        iss: process.env.DOMAIN,
        aud: userId.toString(),
        iat: Math.floor(Date.now() / 1000)
      }

      const options = {
        expiresIn: '1y',
        algorithm: 'HS256'
      }

      JWT.sign(payload, process.env.REFRESH_TOKEN_SECRET, options, (err, token) => {
        if (err) {
          console.error('Refresh token signing error:', err)
          return reject(createError.InternalServerError('Refresh token generation failed'))
        }
        resolve(token)
      })
    })
  },

  verifyRefreshToken: (refreshToken) => {
    return new Promise((resolve, reject) => {
      if (!refreshToken) {
        return reject(createError.BadRequest('Refresh token is required'))
      }

      JWT.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, payload) => {
        if (err) {
          console.error('Refresh token verification error:', err)
          return reject(createError.Unauthorized('Invalid refresh token'))
        }
        resolve(payload.aud)
      })
    })
  }
}
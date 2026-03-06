const jwt = require('jsonwebtoken');

// Access token — short lived, sent in response body
const generateAccessToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },              // payload embedded inside the token
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' }               // expires in 15 minutes
  );
};

// Refresh token — long lived, sent as httpOnly cookie
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

module.exports = { generateAccessToken, generateRefreshToken };
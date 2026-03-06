const User = require('../models/User');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateTokens');
const jwt = require('jsonwebtoken');

// ── Helper: send refresh token as httpOnly cookie ──────────────
const setRefreshCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,    // JS cannot access this cookie — prevents XSS
    secure: process.env.NODE_ENV === 'production',  // HTTPS only in prod
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days in milliseconds
  });
};

// ── SIGNUP ─────────────────────────────────────────────────────
exports.signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    // Create user — password gets hashed automatically via pre-save hook
    const user = await User.create({ name, email, password, role });

    res.status(201).json({ message: 'Account created successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Signup failed', error: err.message });
  }
};

// ── LOGIN ──────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and verify password
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    // Generate both tokens
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token in DB (so we can revoke it on logout)
    user.refreshToken = refreshToken;
    await user.save();

    // Send refresh token as cookie, access token in body
    setRefreshCookie(res, refreshToken);

    res.json({
      accessToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

// ── REFRESH TOKEN ──────────────────────────────────────────────
exports.refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: 'No refresh token' });

    // Verify the token is valid
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    // Also check it matches what's in the DB (covers logout/revocation)
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== token) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    // Rotate: issue new access token (and new refresh token for extra security)
    const newAccessToken = generateAccessToken(user._id, user.role);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save();
    setRefreshCookie(res, newRefreshToken);

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(403).json({ message: 'Token expired or invalid' });
  }
};

// ── LOGOUT ─────────────────────────────────────────────────────
exports.logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      // Remove token from DB — this revokes it even if not expired
      await User.findOneAndUpdate({ refreshToken: token }, { refreshToken: null });
    }
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Logout failed' });
  }
};
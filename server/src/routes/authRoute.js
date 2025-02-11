const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const redisClient = require('../config/redis');
const { authenticate, authorize } = require('../middleware/auth');
const  rateLimit  = require('../middleware/ratelimiter');

const router = express.Router();

const generateAccessToken = (user) => jwt.sign({ id: user._id, role: user.role }, 'JWT_SECRET', { expiresIn: '1m' });
const generateRefreshToken = (user) => jwt.sign({ id: user._id }, 'REFRESH_SECRET', { expiresIn: '7d' });



router.post('/register',rateLimit, async (req, res) => {
    try {
        const { email, password, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ email, password: hashedPassword, role });

        res.status(201).json({ message: 'User registered' });
    } catch (error) {
        console.log(error,"Error")
        res.status(500).json({ message: 'Error registering user' });
    }
});

router.post('/login',rateLimit, async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !await bcrypt.compare(password, user.password)) return res.status(401).json({ message: 'Invalid credentials' });

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        await redisClient.hSet(`sessions:${user._id}`, refreshToken, JSON.stringify({ device: req.headers['user-agent'], loginTime: Date.now() }));
        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'Strict' });

        res.json({ accessToken });
    } catch (error) {
        console.log(error,"ERRRRRRRRRRRRR")
        res.status(500).json({ message: 'Error logging in' });
    }
});

router.post('/refresh',rateLimit, async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) return res.status(401).json({ message: 'Unauthorized' });

        const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
        const storedToken = await redisClient.get(decoded.id);
        if (storedToken !== refreshToken) return res.status(403).json({ message: 'Invalid token' });

        const user = await User.findById(decoded.id);
        const newAccessToken = generateAccessToken(user);
        res.json({ accessToken: newAccessToken });
    } catch (error) {
        res.status(401).json({ message: 'Invalid refresh token' });
    }
});

router.post('/logout',rateLimit, async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) return res.status(401).json({ message: 'Unauthorized' });

        const decoded = jwt.verify(refreshToken,'REFRESH_SECRET');

        await redisClient.del(decoded.id);

        res.clearCookie('refreshToken', { httpOnly: true, secure: true, sameSite: 'Strict' });

        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
});


router.get('/profile',rateLimit, async (req, res) => {

    const user = await User.findById("67a9f9f1601efc04384964e3").select('-password');
    res.json(user);
});

router.get('/sessions', authenticate,rateLimit, async (req, res) => {
    const sessions = await redisClient.hgetall(`sessions:${req.user.id}`);
    res.json(sessions);
});


router.post('/logout/all', authenticate,rateLimit, async (req, res) => {
    await redisClient.del(`sessions:${req.user.id}`); // Remove all sessions
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out from all devices' });
});

router.post('/logout', authenticate,rateLimit, async (req, res) => {
    const { refreshToken } = req.cookies;
    await redisClient.hdel(`sessions:${req.user.id}`, refreshToken); // Remove only this session
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out' });
});



module.exports = router;


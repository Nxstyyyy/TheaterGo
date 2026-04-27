const { json } = require('express');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authorization header missing or malformed' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        console.error('JWT verification failed:', err.message);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

const signToken = (payload) => {
    try {
        console.log(payload)
        return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
    } catch (err) {
        console.error('Error signing token:', err.message);
        throw new Error('Token generation failed');
    }
};

module.exports = { authenticate, signToken };
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const authRoutes = require('./routes/auth');

const APP_PORT = process.env.PORT || 5000;

const app = express();
app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(APP_PORT, () => {
    console.log(`TheaterGo backend is running on port ${APP_PORT}`);
});
require('dotenv').config({});

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const db = require('./database');

const authRoutes = require('./routes/auth');
const showsRoutes = require('./routes/shows');
const bookingsRoutes = require('./routes/bookings');

const APP_PORT = process.env.PORT || 5000;

const app = express();
app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/shows', showsRoutes);
app.use('/api/bookings', bookingsRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(APP_PORT, () => {
    console.log(`TheaterGo backend is running on port ${APP_PORT}`);
});
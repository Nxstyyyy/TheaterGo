require('dotenv').config({});

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
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

app.get('/', (req, res) => {
    res.json({ status: 'ok' });
});

if (process.env.NODE_ENV === 'development') {
    const APK_PATH = path.resolve(
        __dirname,
        process.env.APK_PATH || 'files/TheaterGo.apk'
    );

    app.get('/download/app', (req, res) => {
        if (!fs.existsSync(APK_PATH)) {
            return res.status(404).json({ message: 'APK not found. Run the release build first.' });
        }
        res.download(APK_PATH, path.basename(APK_PATH));
    });
}

db.initDb().then(() => {
    console.log('Database initialized');
}).catch(err => {
    console.error('Error initializing database:', err);
    process.exit(1);
});

app.listen(APP_PORT, () => {
    console.log(`TheaterGo backend is running on port ${APP_PORT}`);
});
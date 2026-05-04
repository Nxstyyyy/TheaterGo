const router = require('express').Router();
const db = require('../database');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, async (req, res) => {
    try {
        const shows = await db.query(`
            SELECT
                sh.id AS show_id,
                sh.show_date,
                sh.show_time,
                p.id AS production_id,
                p.title,
                p.genre,
                p.image_url,
                p.is_trending,
                v.name AS venue_name,
                v.city,
                v.image_url AS venue_image_url,
                CAST((
                    SELECT COUNT(*)
                    FROM seats s2
                    WHERE s2.show_id = sh.id
                    AND s2.id NOT IN (
                        SELECT bs2.seat_id
                        FROM booking_seats bs2
                        JOIN bookings b2 ON b2.id = bs2.booking_id
                        WHERE b2.show_id = sh.id
                            AND b2.status IN ('confirmed', 'pending')
                    )
                ) AS UNSIGNED) AS available_seats,
                sh.price_per_seat AS price
            FROM   shows sh
            JOIN   productions p ON p.id = sh.production_id
            LEFT JOIN venues   v ON v.id = p.venue_id
            WHERE  sh.show_date >= CURDATE()
            ORDER BY sh.show_date, sh.show_time
        `);

        if (shows.length === 0) {
            return res.status(404).json({ error: 'No upcoming shows found' });
        }

        const result = shows.map((s) => ({
            ...s,
            available_seats: Number(s.available_seats),
        }));

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// router.get('/:id', authenticate, async (req, res) => {

// GET /api/shows/:show_id/seats — available seats for a specific show
router.get('/:show_id/seats', authenticate, async (req, res) => {
    try {
        const rows = await db.query(`
            SELECT
                s.id,
                s.row_label,
                s.seat_number,
                CASE WHEN EXISTS (
                    SELECT 1
                    FROM booking_seats bs
                    JOIN bookings b ON b.id = bs.booking_id
                    WHERE bs.seat_id = s.id
                      AND b.show_id = s.show_id
                      AND b.status IN ('confirmed', 'pending')
                ) THEN 1 ELSE 0 END AS is_booked
            FROM seats s
            WHERE s.show_id = ?
            ORDER BY s.row_label, s.seat_number
        `, [req.params.show_id]);

        res.json(rows);
    } catch (err) {
        console.error('Error fetching seats:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
const router = require("express").Router();
const db = require("../database");
const { authenticate } = require("../middleware/auth");

// POST /api/bookings — create a booking
router.post("/", authenticate, async (req, res) => {
    const { show_id, seat_ids } = req.body;

    if (!show_id || !Array.isArray(seat_ids) || seat_ids.length === 0) {
        return res
            .status(400)
            .json({ message: "show_id and at least one seat_id are required" });
    }

    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        // Lock and check that none of the seats are already booked
        const placeholders = seat_ids.map(() => "?").join(",");
        const taken = await conn.query(
            `
            SELECT bs.seat_id
            FROM booking_seats bs
            JOIN bookings b ON b.id = bs.booking_id
            WHERE bs.seat_id IN (${placeholders})
              AND b.show_id = ?
              AND b.status IN ('confirmed', 'pending')
        `,
            [...seat_ids, show_id],
        );

        if (taken.length > 0) {
            await conn.rollback();
            return res
                .status(409)
                .json({
                    message: "One or more selected seats are no longer available",
                });
        }

        // get seat price from show
        const showRows = await conn.query(
            `SELECT price_per_seat FROM shows WHERE id = ?`,
            [show_id],
        );
        const seatPrice = showRows[0]?.price_per_seat || 0;

        const total_price = (seat_ids.length * seatPrice).toFixed(2);

        const result = await conn.query(
            `INSERT INTO bookings (user_id, show_id, total_price, status) VALUES (?, ?, ?, 'pending')`,
            [req.user.id, show_id, total_price],
        );
        const booking_id = Number(result.insertId);

        // Insert each seat into booking_seats
        for (const seat_id of seat_ids) {
            await conn.query(
                `INSERT INTO booking_seats (booking_id, seat_id) VALUES (?, ?)`,
                [booking_id, seat_id],
            );
        }

        await conn.commit();
        res
            .status(201)
            .json({
                booking_id,
                total_price: Number(total_price),
                status: "pending",
            });
    } catch (err) {
        await conn.rollback();
        console.error("Error creating booking:", err.message);
        res.status(500).json({ message: "Internal server error" });
    } finally {
        conn.release();
    }
});

router.get("/upcoming", authenticate, async (req, res) => {
    try {
        const rows = await db.query(
            `
            SELECT
                b.id            AS booking_id,
                b.total_price,
                b.status,
                b.booked_at,
                sh.show_date,
                sh.show_time,
                p.title,
                p.image_url,
                v.name          AS venue_name,
                v.city,
                GROUP_CONCAT(
                    CONCAT(s.row_label, s.seat_number)
                    ORDER BY s.row_label, s.seat_number
                    SEPARATOR ', '
                ) AS seats
            FROM   bookings b
            JOIN   shows          sh ON sh.id = b.show_id
            JOIN   productions     p ON p.id  = sh.production_id
            LEFT JOIN venues       v ON v.id  = p.venue_id
            LEFT JOIN booking_seats bs ON bs.booking_id = b.id
            LEFT JOIN seats         s  ON s.id = bs.seat_id
            WHERE  b.user_id   = ?
              AND  sh.show_date >= CURDATE()
            GROUP BY b.id, b.total_price, b.status, b.booked_at,
                     sh.show_date, sh.show_time, p.title, p.image_url,
                     v.name, v.city
            ORDER BY sh.show_date, sh.show_time
        `,
            [req.user.id],
        );

        res.json(rows);
    } catch (err) {
        console.error("Error fetching upcoming bookings:", err.message);
        res.status(500).json({ message: "Internal server error" });
    }
});

// GET /api/bookings/past  — user's past bookings
router.get("/past", authenticate, async (req, res) => {
    try {
        const rows = await db.query(
            `
            SELECT
                b.id            AS booking_id,
                b.total_price,
                b.status,
                b.booked_at,
                sh.show_date,
                sh.show_time,
                p.title,
                p.image_url,
                v.name          AS venue_name,
                v.city,
                GROUP_CONCAT(
                    CONCAT(s.row_label, s.seat_number)
                    ORDER BY s.row_label, s.seat_number
                    SEPARATOR ', '
                ) AS seats
            FROM   bookings b
            JOIN   shows          sh ON sh.id = b.show_id
            JOIN   productions     p ON p.id  = sh.production_id
            LEFT JOIN venues       v ON v.id  = p.venue_id
            LEFT JOIN booking_seats bs ON bs.booking_id = b.id
            LEFT JOIN seats         s  ON s.id = bs.seat_id
            WHERE  b.user_id   = ?
              AND  sh.show_date < CURDATE()
              AND  b.status    != 'pending'
            GROUP BY b.id, b.total_price, b.status, b.booked_at,
                     sh.show_date, sh.show_time, p.title, p.image_url,
                     v.name, v.city
            ORDER BY sh.show_date DESC
        `,
            [req.user.id],
        );

        res.json(rows);
    } catch (err) {
        console.error("Error fetching past bookings:", err.message);
        res.status(500).json({ message: "Internal server error" });
    }
});

// PATCH /api/bookings/:id/cancel — cancel a pending booking
router.patch("/:id/cancel", authenticate, async (req, res) => {
    const bookingId = parseInt(req.params.id, 10);
    if (!bookingId)
        return res.status(400).json({ message: "Invalid booking id" });

    try {
        const rows = await db.query(
            `SELECT id, user_id, status FROM bookings WHERE id = ?`,
            [bookingId],
        );

        if (rows.length === 0)
            return res.status(404).json({ message: "Booking not found" });

        const booking = rows[0];
        if (booking.user_id !== req.user.id)
            return res.status(403).json({ message: "Forbidden" });
        if (booking.status !== "pending")
            return res
                .status(409)
                .json({ message: "Only pending bookings can be cancelled" });

        await db.query(`UPDATE bookings SET status = 'cancelled' WHERE id = ?`, [
            bookingId,
        ]);

        res.json({
            message: "Booking cancelled",
            booking_id: bookingId,
            status: "cancelled",
        });
    } catch (err) {
        console.error("Error cancelling booking:", err.message);
        res.status(500).json({ message: "Internal server error" });
    }
});

// PATCH /api/bookings/:id/confirm — confirm a pending booking (fake payment)
router.patch("/:id/confirm", authenticate, async (req, res) => {
    const bookingId = parseInt(req.params.id, 10);
    if (!bookingId)
        return res.status(400).json({ message: "Invalid booking id" });

    try {
        const rows = await db.query(
            `SELECT id, user_id, status FROM bookings WHERE id = ?`,
            [bookingId],
        );

        if (rows.length === 0)
            return res.status(404).json({ message: "Booking not found" });

        const booking = rows[0];
        if (booking.user_id !== req.user.id)
            return res.status(403).json({ message: "Forbidden" });
        if (booking.status !== "pending")
            return res.status(409).json({ message: "Booking is not pending" });

        await db.query(`UPDATE bookings SET status = 'confirmed' WHERE id = ?`, [
            bookingId,
        ]);

        res.json({
            message: "Booking confirmed",
            booking_id: bookingId,
            status: "confirmed",
        });
    } catch (err) {
        console.error("Error confirming booking:", err.message);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;

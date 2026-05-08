-- Theater Go — Seed Data

USE `theater_go`;

-- Reset AUTO_INCREMENT generators

ALTER TABLE `booking_seats` DISABLE KEYS;
ALTER TABLE `bookings`      DISABLE KEYS;
ALTER TABLE `seats`         DISABLE KEYS;
ALTER TABLE `shows`         DISABLE KEYS;
ALTER TABLE `productions`   DISABLE KEYS;
ALTER TABLE `venues`        DISABLE KEYS;
ALTER TABLE `users`         DISABLE KEYS;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE `booking_seats`;
TRUNCATE TABLE `bookings`;
TRUNCATE TABLE `seats`;
TRUNCATE TABLE `shows`;
TRUNCATE TABLE `productions`;
TRUNCATE TABLE `venues`;
TRUNCATE TABLE `users`;
SET FOREIGN_KEY_CHECKS = 1;

ALTER TABLE `users`       AUTO_INCREMENT = 1;
ALTER TABLE `venues`      AUTO_INCREMENT = 1;
ALTER TABLE `productions` AUTO_INCREMENT = 1;
ALTER TABLE `shows`       AUTO_INCREMENT = 1;
ALTER TABLE `seats`       AUTO_INCREMENT = 1;
ALTER TABLE `bookings`    AUTO_INCREMENT = 1;

-- Users
-- id: 1=Alex, 2=Jamie, 3=Sam, 4=Taylor

-- use your own hashed password here (the example hash corresponds to "test1234")

INSERT INTO `users` (`name`, `email`, `password`) VALUES
('Alex Morgan',   'alex@example.com',   '$2b$12$OlbxEtKcslKRJwfI0FXK2.WGtBy1fMnVCE0ZmWo1SzmQhmSTXrq5a'),
('Jamie Rivera',  'jamie@example.com',  '$2b$12$OlbxEtKcslKRJwfI0FXK2.WGtBy1fMnVCE0ZmWo1SzmQhmSTXrq5a'),
('Sam Patel',     'sam@example.com',    '$2b$12$OlbxEtKcslKRJwfI0FXK2.WGtBy1fMnVCE0ZmWo1SzmQhmSTXrq5a'),
('Taylor Chen',   'taylor@example.com', '$2b$12$OlbxEtKcslKRJwfI0FXK2.WGtBy1fMnVCE0ZmWo1SzmQhmSTXrq5a');

-- Venues
-- id: 1=Grand Lyric, 2=Prism, 3=Black Box, 4=Richard Rodgers, 5=Gershwin
--     6=Palace Theater, 7=Comedy Cellar Stage

INSERT INTO `venues` (`name`, `address`, `city`, `rating`, `genre`, `image_url`) VALUES
('The Grand Lyric',         '135 W 50th St',   'New York', 4.9, 'Classic Musicals & Opera',   'https://images.unsplash.com/photo-1503095396549-807759245b35?w=200&q=80'),
('Prism Contemporary',      '227 W 42nd St',   'New York', 4.7, 'Experimental & Indie',       'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=200&q=80'),
('Black Box Studio',        '414 W 51st St',   'New York', 4.8, 'Intimate Drama & Solo Acts', 'https://images.unsplash.com/photo-1464375117522-1311d6a5b81f?w=200&q=80'),
('Richard Rodgers Theatre', '226 W 46th St',   'New York', 4.9, 'Classic Musicals & Opera',   'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=200&q=80'),
('Gershwin Theatre',        '222 W 51st St',   'New York', 4.8, 'Classic Musicals & Opera',   'https://images.unsplash.com/photo-1507924538820-ede94a04019d?w=200&q=80'),
('The Palace Theater',      '234 W 47th St',   'New York', 4.8, 'Drama & Opera',              'https://images.unsplash.com/photo-1545987796-200677ee1011?w=200&q=80'),
('Comedy Cellar Stage',     '117 MacDougal St','New York', 4.6, 'Stand-up & Comedy',          'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=200&q=80');

-- Productions
-- id: 1=Hamilton, 2=Wicked, 3=Midnight Chorus, 4=Shattered Mirrors,
--     5=Last Laugh Club, 6=Hadestown, 7=Moulin Rouge, 8=The Lion King
--     9=Phantom of the Opera, 10=Chicago, 11=Streetcar Named Desire,
--     12=Rent, 13=The Book of Mormon, 14=Cats, 15=Oklahoma!

INSERT INTO `productions` (`title`, `genre`, `venue_id`, `description`, `image_url`, `is_trending`, `duration_minutes`) VALUES
('Hamilton: An American Musical', 'Musical', 4, 'The story of America then, told by America now.',                        'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80', 1, 165),
('Wicked',                        'Musical', 5, 'The untold story of the witches of Oz.',                                 'https://images.unsplash.com/photo-1507924538820-ede94a04019d?w=600&q=80', 1, 160),
('The Midnight Chorus',           'Musical', 1, 'A dazzling jazz-infused musical set in 1920s New York.',                 'https://images.unsplash.com/photo-1507924538820-ede94a04019d?w=600&q=80', 1, 120),
('Shattered Mirrors',             'Drama',   2, 'A gripping psychological thriller on the modern stage.',                 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80', 0, 110),
('Last Laugh Club',               'Comedy',  3, 'A witty ensemble comedy that keeps audiences in stitches.',              'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=600&q=80', 0,  90),
('Hadestown',                     'Musical', 1, 'Where a song can change your fate.',                                     'https://images.unsplash.com/photo-1464375117522-1311d6a5b81f?w=600&q=80', 0, 150),
('Moulin Rouge! The Musical',     'Musical', 5, 'The greatest show. The greatest love story ever told.',                  'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=600&q=80', 0, 150),
('The Lion King',                 'Musical', 1, 'The Pride Lands come to life on Broadway.',                              'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=600&q=80', 0, 150),
('The Phantom of the Opera',      'Opera',   6, 'Andrew Lloyd Webber\'s timeless tale of obsession beneath the Paris Opera.','https://images.unsplash.com/photo-1503095396549-807759245b35?w=600&q=80', 1, 145),
('Chicago',                       'Musical', 4, 'All that jazz in the city of sin. Murder, ambition, and razzle-dazzle.',  'https://images.unsplash.com/photo-1545987796-200677ee1011?w=600&q=80', 1, 135),
('A Streetcar Named Desire',      'Drama',   2, 'Tennessee Williams\' raw portrait of desire, delusion, and decline.',     'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=600&q=80', 0, 120),
('Rent',                          'Musical', 3, 'A bohemian anthem of love and survival in New York City.',                'https://images.unsplash.com/photo-1464375117522-1311d6a5b81f?w=600&q=80', 0, 150),
('The Book of Mormon',            'Comedy',  5, 'The hilarious, award-winning musical from the creators of South Park.',   'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=600&q=80', 1, 135),
('Cats',                          'Musical', 1, 'Memories and mystery in Andrew Lloyd Webber\'s beloved feline fantasy.',   'https://images.unsplash.com/photo-1503095396549-807759245b35?w=600&q=80', 0, 130),
('Oklahoma!',                     'Musical', 4, 'Rodgers & Hammerstein\'s landmark celebration of the American frontier.',  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80', 0, 150);

-- Shows
-- id: 1=Hamilton eve, 2=Hamilton mat, 3=Wicked eve, 4=Wicked mat,
--     5=Midnight Chorus eve, 6=Midnight Chorus mat, 7=Shattered Mirrors,
--     8=Last Laugh Club, 9=Hadestown (past), 10=Moulin Rouge (past), 11=Lion King (past),
--     12=Phantom eve, 13=Phantom mat, 14=Chicago eve, 15=Streetcar,
--     16=Rent, 17=Book of Mormon, 18=Cats, 19=Oklahoma,
--     20=Chicago (past), 21=Rent (past)

INSERT INTO `shows` (`production_id`, `show_date`, `show_time`, `price_per_seat`) VALUES
(1,  CURDATE() + INTERVAL 7  DAY, '19:30:00', 85.00),  -- 1  Hamilton eve
(1,  CURDATE() + INTERVAL 8  DAY, '14:00:00', 75.00),  -- 2  Hamilton mat
(2,  CURDATE() + INTERVAL 21 DAY, '20:00:00', 79.00),  -- 3  Wicked eve
(2,  CURDATE() + INTERVAL 22 DAY, '14:00:00', 69.00),  -- 4  Wicked mat
(3,  CURDATE() + INTERVAL 35 DAY, '19:30:00', 55.00),  -- 5  Midnight Chorus eve
(3,  CURDATE() + INTERVAL 36 DAY, '15:00:00', 45.00),  -- 6  Midnight Chorus mat
(4,  CURDATE() + INTERVAL 49 DAY, '20:00:00', 50.00),  -- 7  Shattered Mirrors
(5,  CURDATE() + INTERVAL 56 DAY, '20:00:00', 35.00),  -- 8  Last Laugh Club
(6,  '2023-09-14', '19:30:00',                60.00),  -- 9  Hadestown (past)
(7,  '2023-08-02', '20:00:00',                70.00),  -- 10 Moulin Rouge (past)
(8,  '2023-05-21', '19:00:00',                65.00),  -- 11 Lion King (past)
(9,  CURDATE() + INTERVAL 14 DAY, '19:30:00', 90.00),  -- 12 Phantom eve
(9,  CURDATE() + INTERVAL 15 DAY, '14:00:00', 80.00),  -- 13 Phantom mat
(10, CURDATE() + INTERVAL 28 DAY, '20:00:00', 72.00),  -- 14 Chicago eve
(11, CURDATE() + INTERVAL 42 DAY, '19:00:00', 48.00),  -- 15 Streetcar
(12, CURDATE() + INTERVAL 63 DAY, '20:00:00', 55.00),  -- 16 Rent
(13, CURDATE() + INTERVAL 70 DAY, '19:30:00', 78.00),  -- 17 Book of Mormon
(14, CURDATE() + INTERVAL 77 DAY, '19:30:00', 62.00),  -- 18 Cats
(15, CURDATE() + INTERVAL 84 DAY, '14:00:00', 58.00),  -- 19 Oklahoma
(10, '2022-11-05', '20:00:00',                70.00),  -- 20 Chicago (past)
(12, '2022-09-18', '19:30:00',                55.00);  -- 21 Rent (past)

-- Seats
-- Seat ids are computed from insertion order (AUTO_INCREMENT).
-- Each block documents the resulting id range.

-- Show 1 — Hamilton Oct 24 evening  → ids 1–20
-- A1-A5=1-5 | B1-B5=6-10 | M1-M5=11-15 | M6-M10=16-20
INSERT INTO `seats` (`show_id`, `row_label`, `seat_number`) VALUES
(1,'A',1),(1,'A',2),(1,'A',3),(1,'A',4),(1,'A',5),
(1,'B',1),(1,'B',2),(1,'B',3),(1,'B',4),(1,'B',5),
(1,'M',1),(1,'M',2),(1,'M',3),(1,'M',4),(1,'M',5),
(1,'M',6),(1,'M',7),(1,'M',8),(1,'M',9),(1,'M',10);

-- Show 2 — Hamilton Oct 25 matinee  → ids 21–35
-- A1-A5=21-25 | B1-B5=26-30 | M1-M5=31-35
INSERT INTO `seats` (`show_id`, `row_label`, `seat_number`) VALUES
(2,'A',1),(2,'A',2),(2,'A',3),(2,'A',4),(2,'A',5),
(2,'B',1),(2,'B',2),(2,'B',3),(2,'B',4),(2,'B',5),
(2,'M',1),(2,'M',2),(2,'M',3),(2,'M',4),(2,'M',5);

-- Show 3 — Wicked Nov 12 evening  → ids 36–53
-- A1-A5=36-40 | B1-B8=41-48 | C1-C5=49-53
INSERT INTO `seats` (`show_id`, `row_label`, `seat_number`) VALUES
(3,'A',1),(3,'A',2),(3,'A',3),(3,'A',4),(3,'A',5),
(3,'B',1),(3,'B',2),(3,'B',3),(3,'B',4),(3,'B',5),
(3,'B',6),(3,'B',7),(3,'B',8),
(3,'C',1),(3,'C',2),(3,'C',3),(3,'C',4),(3,'C',5);

-- Show 5 — Midnight Chorus May 10 evening  → ids 54–68
-- A1-A5=54-58 | B1-B5=59-63 | C1-C5=64-68
INSERT INTO `seats` (`show_id`, `row_label`, `seat_number`) VALUES
(5,'A',1),(5,'A',2),(5,'A',3),(5,'A',4),(5,'A',5),
(5,'B',1),(5,'B',2),(5,'B',3),(5,'B',4),(5,'B',5),
(5,'C',1),(5,'C',2),(5,'C',3),(5,'C',4),(5,'C',5);

-- Show 9 — Hadestown (past)  → ids 69–73
-- D1-D5=69-73
INSERT INTO `seats` (`show_id`, `row_label`, `seat_number`) VALUES
(9,'D',1),(9,'D',2),(9,'D',3),(9,'D',4),(9,'D',5);

-- Show 10 — Moulin Rouge (past)  → ids 74–78
-- E1-E5=74-78
INSERT INTO `seats` (`show_id`, `row_label`, `seat_number`) VALUES
(10,'E',1),(10,'E',2),(10,'E',3),(10,'E',4),(10,'E',5);

-- Show 11 — The Lion King (past)  → ids 79–83
-- F1-F5=79-83
INSERT INTO `seats` (`show_id`, `row_label`, `seat_number`) VALUES
(11,'F',1),(11,'F',2),(11,'F',3),(11,'F',4),(11,'F',5);

-- Show 12 — Phantom eve  → ids 84–98
-- A1-A5=84-88 | B1-B5=89-93 | C1-C5=94-98
INSERT INTO `seats` (`show_id`, `row_label`, `seat_number`) VALUES
(12,'A',1),(12,'A',2),(12,'A',3),(12,'A',4),(12,'A',5),
(12,'B',1),(12,'B',2),(12,'B',3),(12,'B',4),(12,'B',5),
(12,'C',1),(12,'C',2),(12,'C',3),(12,'C',4),(12,'C',5);

-- Show 13 — Phantom mat  → ids 99–113
-- A1-A5=99-103 | B1-B5=104-108 | C1-C5=109-113
INSERT INTO `seats` (`show_id`, `row_label`, `seat_number`) VALUES
(13,'A',1),(13,'A',2),(13,'A',3),(13,'A',4),(13,'A',5),
(13,'B',1),(13,'B',2),(13,'B',3),(13,'B',4),(13,'B',5),
(13,'C',1),(13,'C',2),(13,'C',3),(13,'C',4),(13,'C',5);

-- Show 14 — Chicago eve  → ids 114–128
-- A1-A5=114-118 | B1-B5=119-123 | C1-C5=124-128
INSERT INTO `seats` (`show_id`, `row_label`, `seat_number`) VALUES
(14,'A',1),(14,'A',2),(14,'A',3),(14,'A',4),(14,'A',5),
(14,'B',1),(14,'B',2),(14,'B',3),(14,'B',4),(14,'B',5),
(14,'C',1),(14,'C',2),(14,'C',3),(14,'C',4),(14,'C',5);

-- Show 15 — A Streetcar Named Desire  → ids 129–138
-- A1-A5=129-133 | B1-B5=134-138
INSERT INTO `seats` (`show_id`, `row_label`, `seat_number`) VALUES
(15,'A',1),(15,'A',2),(15,'A',3),(15,'A',4),(15,'A',5),
(15,'B',1),(15,'B',2),(15,'B',3),(15,'B',4),(15,'B',5);

-- Show 16 — Rent  → ids 139–148
-- A1-A5=139-143 | B1-B5=144-148
INSERT INTO `seats` (`show_id`, `row_label`, `seat_number`) VALUES
(16,'A',1),(16,'A',2),(16,'A',3),(16,'A',4),(16,'A',5),
(16,'B',1),(16,'B',2),(16,'B',3),(16,'B',4),(16,'B',5);

-- Show 17 — The Book of Mormon  → ids 149–163
-- A1-A5=149-153 | B1-B5=154-158 | C1-C5=159-163
INSERT INTO `seats` (`show_id`, `row_label`, `seat_number`) VALUES
(17,'A',1),(17,'A',2),(17,'A',3),(17,'A',4),(17,'A',5),
(17,'B',1),(17,'B',2),(17,'B',3),(17,'B',4),(17,'B',5),
(17,'C',1),(17,'C',2),(17,'C',3),(17,'C',4),(17,'C',5);

-- Show 18 — Cats  → ids 164–178
-- A1-A5=164-168 | B1-B5=169-173 | C1-C5=174-178
INSERT INTO `seats` (`show_id`, `row_label`, `seat_number`) VALUES
(18,'A',1),(18,'A',2),(18,'A',3),(18,'A',4),(18,'A',5),
(18,'B',1),(18,'B',2),(18,'B',3),(18,'B',4),(18,'B',5),
(18,'C',1),(18,'C',2),(18,'C',3),(18,'C',4),(18,'C',5);

-- Show 19 — Oklahoma!  → ids 179–193
-- A1-A5=179-183 | B1-B5=184-188 | C1-C5=189-193
INSERT INTO `seats` (`show_id`, `row_label`, `seat_number`) VALUES
(19,'A',1),(19,'A',2),(19,'A',3),(19,'A',4),(19,'A',5),
(19,'B',1),(19,'B',2),(19,'B',3),(19,'B',4),(19,'B',5),
(19,'C',1),(19,'C',2),(19,'C',3),(19,'C',4),(19,'C',5);

-- Show 20 — Chicago (past)  → ids 194–198
-- D1-D5=194-198
INSERT INTO `seats` (`show_id`, `row_label`, `seat_number`) VALUES
(20,'D',1),(20,'D',2),(20,'D',3),(20,'D',4),(20,'D',5);

-- Show 21 — Rent (past)  → ids 199–203
-- D1-D5=199-203
INSERT INTO `seats` (`show_id`, `row_label`, `seat_number`) VALUES
(21,'D',1),(21,'D',2),(21,'D',3),(21,'D',4),(21,'D',5);

-- Bookings
-- id: 1=Alex/Hamilton-eve, 2=Alex/Wicked, 3=Alex/Hadestown,
--     4=Alex/MoulinRouge,  5=Alex/LionKing, 6=Jamie/MidnightChorus, 7=Sam/Hamilton-mat
--     8=Alex/Chicago-eve,  9=Alex/BookOfMormon, 10=Alex/Chicago(past)

INSERT INTO `bookings` (`user_id`, `show_id`, `total_price`, `status`, `booked_at`) VALUES
(1,  1,  290.00, 'confirmed', NOW() - INTERVAL 5 DAY),   -- 1  Alex  — Hamilton evening
(1,  3,  145.00, 'pending',   NOW() - INTERVAL 3 DAY),   -- 2  Alex  — Wicked evening
(1,  9,  145.00, 'confirmed', '2023-08-20 09:00:00'),    -- 3  Alex  — Hadestown (past)
(1,  10, 189.00, 'confirmed', '2023-07-15 11:00:00'),    -- 4  Alex  — Moulin Rouge (past)
(1,  11, 210.00, 'confirmed', '2023-04-30 08:00:00'),    -- 5  Alex  — Lion King (past)
(2,  5,  180.00, 'confirmed', NOW() - INTERVAL 2 DAY),   -- 6  Jamie — Midnight Chorus
(3,  2,  155.00, 'pending',   NOW() - INTERVAL 1 DAY),   -- 7  Sam   — Hamilton matinee
(1,  14, 175.00, 'confirmed', NOW() - INTERVAL 6 DAY),   -- 8  Alex  — Chicago evening
(1,  17, 165.00, 'pending',   NOW() - INTERVAL 2 DAY),   -- 9  Alex  — Book of Mormon
(1,  20, 160.00, 'confirmed', '2022-10-20 10:00:00');    -- 10 Alex  — Chicago (past)

-- Booking Seats
-- booking_id → seat_ids (derived from the seat id ranges above)

INSERT INTO `booking_seats` (`booking_id`, `seat_id`) VALUES
-- Booking 1: Alex, Hamilton eve — Row M seats 6 & 7  (ids 16, 17)
(1, 16),(1, 17),
-- Booking 2: Alex, Wicked eve  — Row B seat 4        (id 44)
(2, 44),
-- Booking 3: Alex, Hadestown   — Row D seat 2        (id 70)
(3, 70),
-- Booking 4: Alex, Moulin Rouge — Row E seat 1       (id 74)
(4, 74),
-- Booking 5: Alex, Lion King   — Row F seat 3        (id 81)
(5, 81),
-- Booking 6: Jamie, Midnight Chorus — Row A seats 1 & 2 (ids 54, 55)
(6, 54),(6, 55),
-- Booking 7: Sam, Hamilton mat — Row B seat 3        (id 28)
(7, 28),
-- Booking 8: Alex, Chicago eve — Row A seat 1        (id 114)
(8, 114),
-- Booking 9: Alex, Book of Mormon — Row C seat 1    (id 159)
(9, 159),
-- Booking 10: Alex, Chicago past — Row D seat 3     (id 196)
(10, 196);

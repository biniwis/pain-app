const express = require('express');
const db = require('../db');

const publicRouter = express.Router();
const adminRouter = express.Router();

publicRouter.post('/', (req, res) => {
  const { slot_id, client_name, client_email, client_phone, department, notes } = req.body || {};

  if (!slot_id || !client_name || !client_name.trim()) {
    return res.status(400).json({ error: 'slot_id and client_name are required' });
  }

  const createBooking = db.transaction(() => {
    const slot = db
      .prepare(
        `SELECT s.*, e.name AS event_name, e.slug AS event_slug
         FROM slots s
         JOIN events e ON e.id = s.event_id
         WHERE s.id = ?`
      )
      .get(slot_id);

    if (!slot) {
      const err = new Error('Slot not found');
      err.status = 404;
      throw err;
    }
    if (slot.is_booked) {
      const err = new Error('Slot is already booked');
      err.status = 409;
      throw err;
    }

    db.prepare('UPDATE slots SET is_booked = 1 WHERE id = ?').run(slot_id);
    const info = db
      .prepare(
        `INSERT INTO bookings (slot_id, client_name, client_email, client_phone, department, notes)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(slot_id, client_name.trim(), client_email || null, client_phone || null, department || null, notes || null);

    return { booking_id: info.lastInsertRowid, slot };
  });

  try {
    const { booking_id, slot } = createBooking();
    res.status(201).json({
      id: booking_id,
      slot: { id: slot.id, date: slot.date, start_time: slot.start_time, end_time: slot.end_time },
      event: { name: slot.event_name, slug: slot.event_slug },
      client_name: client_name.trim(),
    });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ error: err.message });
  }
});

adminRouter.patch('/:id', (req, res) => {
  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }
  const { attended } = req.body || {};
  db.prepare('UPDATE bookings SET attended = ? WHERE id = ?').run(attended ? 1 : 0, req.params.id);
  res.json({ ok: true });
});

adminRouter.delete('/:id', (req, res) => {
  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }
  const deleteBooking = db.transaction(() => {
    db.prepare('DELETE FROM bookings WHERE id = ?').run(req.params.id);
    db.prepare('UPDATE slots SET is_booked = 0 WHERE id = ?').run(booking.slot_id);
  });
  deleteBooking();
  res.json({ ok: true });
});

module.exports = { publicRouter, adminRouter };

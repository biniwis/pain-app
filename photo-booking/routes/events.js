const express = require('express');
const crypto = require('crypto');
const db = require('../db');

const publicRouter = express.Router();
const adminRouter = express.Router();

function generateSlug() {
  let slug;
  let exists;
  do {
    slug = crypto.randomBytes(4).toString('hex');
    exists = db.prepare('SELECT 1 FROM events WHERE slug = ?').get(slug);
  } while (exists);
  return slug;
}

function timeToMinutes(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(mins) {
  const h = String(Math.floor(mins / 60)).padStart(2, '0');
  const m = String(mins % 60).padStart(2, '0');
  return `${h}:${m}`;
}

// --- Admin ---

adminRouter.get('/', (req, res) => {
  const events = db
    .prepare(
      `SELECT e.id, e.name, e.slug, e.created_at,
              COUNT(s.id) AS slot_count,
              COALESCE(SUM(s.is_booked), 0) AS booked_count
       FROM events e
       LEFT JOIN slots s ON s.event_id = e.id
       GROUP BY e.id
       ORDER BY e.created_at DESC`
    )
    .all();
  res.json(events);
});

adminRouter.post('/', (req, res) => {
  const { name } = req.body || {};
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'name is required' });
  }
  const slug = generateSlug();
  const info = db.prepare('INSERT INTO events (name, slug) VALUES (?, ?)').run(name.trim(), slug);
  res.status(201).json({ id: info.lastInsertRowid, name: name.trim(), slug });
});

adminRouter.patch('/:id', (req, res) => {
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }
  const { name } = req.body || {};
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'name is required' });
  }
  db.prepare('UPDATE events SET name = ? WHERE id = ?').run(name.trim(), req.params.id);
  res.json({ ok: true, name: name.trim() });
});

adminRouter.delete('/:id', (req, res) => {
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }
  const deleteEvent = db.transaction(() => {
    db.prepare(
      'DELETE FROM bookings WHERE slot_id IN (SELECT id FROM slots WHERE event_id = ?)'
    ).run(req.params.id);
    db.prepare('DELETE FROM slots WHERE event_id = ?').run(req.params.id);
    db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id);
  });
  deleteEvent();
  res.json({ ok: true });
});

adminRouter.get('/:id/slots', (req, res) => {
  const slots = db
    .prepare(
      `SELECT s.id, s.date, s.start_time, s.end_time, s.is_booked,
              b.client_name, b.client_email, b.client_phone, b.department
       FROM slots s
       LEFT JOIN bookings b ON b.slot_id = s.id
       WHERE s.event_id = ?
       ORDER BY s.date, s.start_time`
    )
    .all(req.params.id);
  res.json(slots);
});

adminRouter.post('/:id/slots', (req, res) => {
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }

  const { date, start_time, end_time, duration_minutes, break_start, break_end, overwrite } = req.body || {};
  const duration = Number(duration_minutes);
  if (!date || !start_time || !end_time || !duration || duration <= 0) {
    return res
      .status(400)
      .json({ error: 'date, start_time, end_time and a positive duration_minutes are required' });
  }

  const startMin = timeToMinutes(start_time);
  const endMin = timeToMinutes(end_time);
  if (Number.isNaN(startMin) || Number.isNaN(endMin) || endMin <= startMin) {
    return res.status(400).json({ error: 'end_time must be after start_time' });
  }

  let breakStartMin = null;
  let breakEndMin = null;
  if (break_start && break_end) {
    breakStartMin = timeToMinutes(break_start);
    breakEndMin = timeToMinutes(break_end);
    if (Number.isNaN(breakStartMin) || Number.isNaN(breakEndMin) || breakEndMin <= breakStartMin) {
      return res.status(400).json({ error: 'break_end must be after break_start' });
    }
  }

  const ranges = [];
  for (let t = startMin; t + duration <= endMin; t += duration) {
    const slotEnd = t + duration;
    const overlapsBreak = breakStartMin !== null && t < breakEndMin && slotEnd > breakStartMin;
    if (overlapsBreak) continue;
    ranges.push({ start_time: minutesToTime(t), end_time: minutesToTime(slotEnd) });
  }
  if (ranges.length === 0) {
    return res
      .status(400)
      .json({ error: 'No slots could be created for this range (check the duration and break times)' });
  }

  const insert = db.prepare(
    'INSERT INTO slots (event_id, date, start_time, end_time) VALUES (?, ?, ?, ?)'
  );
  const insertMany = db.transaction((rows) => {
    if (overwrite === 'true' || overwrite === true) {
      db.prepare(`
        DELETE FROM bookings 
        WHERE slot_id IN (SELECT id FROM slots WHERE event_id = ? AND date = ?)
      `).run(event.id, date);
      db.prepare('DELETE FROM slots WHERE event_id = ? AND date = ?').run(event.id, date);
    }
    const created = [];
    for (const row of rows) {
      const info = insert.run(event.id, date, row.start_time, row.end_time);
      created.push({ id: info.lastInsertRowid, date, start_time: row.start_time, end_time: row.end_time });
    }
    return created;
  });

  res.status(201).json(insertMany(ranges));
});

adminRouter.get('/:id/bookings', (req, res) => {
  const bookings = db
    .prepare(
      `SELECT b.id, b.client_name, b.client_email, b.client_phone, b.department, b.notes, b.attended,
              s.date, s.start_time, s.end_time
       FROM bookings b
       JOIN slots s ON s.id = b.slot_id
       WHERE s.event_id = ?
       ORDER BY s.date, s.start_time`
    )
    .all(req.params.id);
  res.json(bookings);
});

// --- Public ---

publicRouter.get('/:slug', (req, res) => {
  const event = db.prepare('SELECT id, name, slug FROM events WHERE slug = ?').get(req.params.slug);
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }
  res.json(event);
});

publicRouter.get('/:slug/slots', (req, res) => {
  const event = db.prepare('SELECT id FROM events WHERE slug = ?').get(req.params.slug);
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }
  const slots = db
    .prepare(
      'SELECT id, date, start_time, end_time FROM slots WHERE event_id = ? AND is_booked = 0 ORDER BY date, start_time'
    )
    .all(event.id);
  res.json(slots);
});

// Public registrants list: intentionally omits contact info and attendance status.
publicRouter.get('/:slug/bookings', (req, res) => {
  const event = db.prepare('SELECT id FROM events WHERE slug = ?').get(req.params.slug);
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }
  const bookings = db
    .prepare(
      `SELECT b.id, s.date, s.start_time, b.client_name, b.department
       FROM bookings b
       JOIN slots s ON s.id = b.slot_id
       WHERE s.event_id = ?
       ORDER BY s.date, s.start_time`
    )
    .all(event.id);
  res.json(bookings);
});

module.exports = { publicRouter, adminRouter };

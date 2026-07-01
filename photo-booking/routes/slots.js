const express = require('express');
const db = require('../db');

const adminRouter = express.Router();

adminRouter.delete('/:id', (req, res) => {
  const slot = db.prepare('SELECT * FROM slots WHERE id = ?').get(req.params.id);
  if (!slot) {
    return res.status(404).json({ error: 'Slot not found' });
  }
  if (slot.is_booked) {
    return res.status(400).json({ error: 'Cannot delete a booked slot' });
  }
  db.prepare('DELETE FROM slots WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = { adminRouter };

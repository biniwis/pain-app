const express = require('express');

const router = express.Router();

function requireAdmin(req, res, next) {
  const provided = req.header('x-admin-password');
  if (!provided || provided !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

router.post('/login', (req, res) => {
  const { password } = req.body || {};
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Incorrect password' });
  }
  res.json({ ok: true });
});

module.exports = { router, requireAdmin };

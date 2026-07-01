require('dotenv').config();
const express = require('express');
const path = require('path');

const { router: adminAuthRouter, requireAdmin } = require('./routes/admin');
const { publicRouter: eventsPublicRouter, adminRouter: eventsAdminRouter } = require('./routes/events');
const { adminRouter: slotsAdminRouter } = require('./routes/slots');
const { publicRouter: bookingsPublicRouter, adminRouter: bookingsAdminRouter } = require('./routes/bookings');

if (!process.env.ADMIN_PASSWORD) {
  console.warn('Warning: ADMIN_PASSWORD is not set. Copy .env.example to .env and set a password.');
}

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/events', eventsPublicRouter);
app.use('/api/bookings', bookingsPublicRouter);
app.use('/api/admin', adminAuthRouter);
app.use('/api/admin/events', requireAdmin, eventsAdminRouter);
app.use('/api/admin/slots', requireAdmin, slotsAdminRouter);
app.use('/api/admin/bookings', requireAdmin, bookingsAdminRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Photo booking server listening on http://localhost:${port}`);
});

const app = document.getElementById('app');
const STORAGE_KEY = 'photoBookingAdminPassword';

const state = {
  password: localStorage.getItem(STORAGE_KEY) || null,
  authError: null,
  view: 'events', // 'events' | 'event-detail'
  events: [],
  currentEvent: null,
  slots: [],
  bookings: [],
  formError: null,
  formMessage: null,
};

function authHeaders() {
  return { 'x-admin-password': state.password };
}

async function tryLogin(password) {
  const res = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  return res.ok;
}

async function apiGet(url) {
  const res = await fetch(url, { headers: authHeaders() });
  if (res.status === 401) {
    localStorage.removeItem(STORAGE_KEY);
    state.password = null;
    state.authError = 'הסיסמה שגויה, נסו שוב.';
    return null;
  }
  return res.json();
}

async function loadEvents() {
  const events = await apiGet('/api/admin/events');
  if (events === null) return false;
  state.events = events;
  return true;
}

async function loadEventDetail(eventId) {
  const [slots, bookings] = await Promise.all([
    apiGet(`/api/admin/events/${eventId}/slots`),
    apiGet(`/api/admin/events/${eventId}/bookings`),
  ]);
  if (slots === null || bookings === null) return false;
  state.slots = slots;
  state.bookings = bookings;
  return true;
}

function bookingLink(slug) {
  return `${location.origin}/?event=${slug}`;
}

function renderLogin() {
  app.innerHTML = `
    <div class="card">
      ${state.authError ? `<p class="error">${state.authError}</p>` : ''}
      <form id="login-form">
        <label><span>סיסמת ניהול</span><input type="password" name="password" required autofocus /></label>
        <button type="submit" class="primary">כניסה</button>
      </form>
    </div>
  `;

  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = new FormData(e.target).get('password');
    const ok = await tryLogin(password);
    if (!ok) {
      state.authError = 'הסיסמה שגויה, נסו שוב.';
      render();
      return;
    }
    state.password = password;
    localStorage.setItem(STORAGE_KEY, password);
    state.authError = null;
    await loadEvents();
    render();
  });
}

function renderEventsList() {
  const rows = state.events
    .map(
      (ev) => `
      <div class="card">
        <h2>${ev.name}</h2>
        <p class="muted">${ev.slot_count} תורים, ${ev.booked_count} תפוסים</p>
        <label><span>קישור לשיתוף</span><input type="text" readonly value="${bookingLink(ev.slug)}" data-copy-link="${ev.slug}" /></label>
        <div class="actions-row">
          <button type="button" class="secondary" data-copy="${ev.slug}">העתקת קישור</button>
          <button type="button" class="primary" data-manage="${ev.id}">ניהול</button>
        </div>
      </div>
    `
    )
    .join('');

  app.innerHTML = `
    <div class="card">
      <h2>אירוע חדש</h2>
      ${state.formError ? `<p class="error">${state.formError}</p>` : ''}
      <form id="new-event-form">
        <label><span>שם האירוע (למשל: שם החברה)</span><input type="text" name="name" required /></label>
        <button type="submit" class="primary">יצירת אירוע</button>
      </form>
    </div>
    ${rows || '<p class="muted">אין אירועים עדיין.</p>'}
  `;

  document.getElementById('new-event-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = new FormData(e.target).get('name');
    const res = await fetch('/api/admin/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) {
      const body = await res.json();
      state.formError = body.error || 'משהו השתבש.';
      render();
      return;
    }
    state.formError = null;
    await loadEvents();
    render();
  });

  app.querySelectorAll('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      await navigator.clipboard.writeText(bookingLink(btn.dataset.copy));
      btn.textContent = 'הועתק!';
      setTimeout(() => (btn.textContent = 'העתקת קישור'), 1500);
    });
  });

  app.querySelectorAll('[data-manage]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const eventId = btn.dataset.manage;
      const event = state.events.find((ev) => String(ev.id) === eventId);
      state.currentEvent = event;
      state.view = 'event-detail';
      state.formError = null;
      state.formMessage = null;
      const ok = await loadEventDetail(eventId);
      if (!ok) {
        render();
        return;
      }
      render();
    });
  });
}

function renderEventDetail() {
  const ev = state.currentEvent;
  const slotRows = state.slots
    .map((s) => {
      const statusHtml = s.is_booked
        ? `<span class="status-booked">תפוס - ${s.client_name || ''}</span>`
        : '<span class="status-open">פנוי</span>';
      const deleteBtn = s.is_booked
        ? ''
        : `<button type="button" class="link" data-delete-id="${s.id}">מחיקה</button>`;
      return `<tr><td>${s.date}</td><td>${s.start_time}-${s.end_time}</td><td>${statusHtml}</td><td>${deleteBtn}</td></tr>`;
    })
    .join('');

  const bookingRows = state.bookings
    .map(
      (b) => `
      <tr>
        <td>${b.date}</td>
        <td>${b.start_time}-${b.end_time}</td>
        <td>${b.client_name}</td>
        <td>${b.client_email || ''}${b.client_email && b.client_phone ? ' / ' : ''}${b.client_phone || ''}</td>
        <td>${b.department || ''}</td>
        <td>
          <label style="display:inline-flex; align-items:center; gap:4px; margin:0;">
            <input type="checkbox" data-attended-id="${b.id}" ${b.attended ? 'checked' : ''} style="width:auto;" />
            <span style="display:inline;">הגיע/ה</span>
          </label>
        </td>
      </tr>
    `
    )
    .join('');

  app.innerHTML = `
    <button type="button" class="secondary" id="back-to-events">&rarr; חזרה לרשימת האירועים</button>

    <div class="card">
      <h2>${ev.name}</h2>
      <label><span>קישור לשיתוף עם הלקוח</span><input type="text" readonly value="${bookingLink(ev.slug)}" /></label>
      <button type="button" class="secondary" id="copy-detail-link">העתקת קישור</button>
    </div>

    <div class="card">
      <h2>הוספת תורים</h2>
      ${state.formError ? `<p class="error">${state.formError}</p>` : ''}
      ${state.formMessage ? `<p class="muted">${state.formMessage}</p>` : ''}
      <form id="slots-form">
        <label><span>תאריך</span><input type="date" name="date" required /></label>
        <label><span>משעה</span><input type="time" name="start_time" required /></label>
        <label><span>עד שעה</span><input type="time" name="end_time" required /></label>
        <label><span>משך כל תור (בדקות)</span><input type="number" name="duration_minutes" min="1" value="15" required /></label>
        <button type="submit" class="primary">יצירת תורים</button>
      </form>
    </div>

    <div class="card">
      <h2>כל התורים</h2>
      <table>
        <thead><tr><th>תאריך</th><th>שעה</th><th>סטטוס</th><th></th></tr></thead>
        <tbody>${slotRows || '<tr><td colspan="4" class="muted">אין תורים עדיין</td></tr>'}</tbody>
      </table>
    </div>

    <div class="card">
      <h2>הזמנות</h2>
      <table>
        <thead><tr><th>תאריך</th><th>שעה</th><th>שם</th><th>פרטי קשר</th><th>מחלקה</th><th>הגעה</th></tr></thead>
        <tbody>${bookingRows || '<tr><td colspan="6" class="muted">אין הזמנות עדיין</td></tr>'}</tbody>
      </table>
    </div>
  `;

  document.getElementById('back-to-events').addEventListener('click', async () => {
    state.view = 'events';
    state.currentEvent = null;
    await loadEvents();
    render();
  });

  document.getElementById('copy-detail-link').addEventListener('click', async (e) => {
    await navigator.clipboard.writeText(bookingLink(ev.slug));
    e.target.textContent = 'הועתק!';
    setTimeout(() => (e.target.textContent = 'העתקת קישור'), 1500);
  });

  document.querySelectorAll('[data-delete-id]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.deleteId;
      const res = await fetch(`/api/admin/slots/${id}`, { method: 'DELETE', headers: authHeaders() });
      if (res.ok) {
        await loadEventDetail(ev.id);
        render();
      }
    });
  });

  document.querySelectorAll('[data-attended-id]').forEach((checkbox) => {
    checkbox.addEventListener('change', async () => {
      const id = checkbox.dataset.attendedId;
      const booking = state.bookings.find((b) => String(b.id) === id);
      booking.attended = checkbox.checked ? 1 : 0;
      await fetch(`/api/admin/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ attended: checkbox.checked }),
      });
    });
  });

  document.getElementById('slots-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());

    const res = await fetch(`/api/admin/events/${ev.id}/slots`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const body = await res.json();
      state.formError = body.error || 'משהו השתבש.';
      state.formMessage = null;
      render();
      return;
    }

    const created = await res.json();
    state.formError = null;
    state.formMessage = `נוצרו ${created.length} תורים בהצלחה.`;
    await loadEventDetail(ev.id);
    render();
  });
}

function render() {
  if (!state.password) {
    renderLogin();
    return;
  }
  if (state.view === 'event-detail' && state.currentEvent) {
    renderEventDetail();
    return;
  }
  renderEventsList();
}

(async function init() {
  if (state.password) {
    const ok = await loadEvents();
    if (!ok) {
      render();
      return;
    }
  }
  render();
})();

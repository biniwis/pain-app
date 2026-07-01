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
  showAddSlots: false,
};

/* ── Helpers ── */

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

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('he-IL', { weekday: 'short', day: 'numeric', month: 'long' });
}

function getEventSlotsParams(slots) {
  if (slots.length === 0) return null;
  const start_time = slots[0].start_time;
  const end_time = slots[slots.length - 1].end_time;
  const toMins = (t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  const duration_minutes = toMins(slots[0].end_time) - toMins(slots[0].start_time);
  let break_start = '';
  let break_end = '';
  for (let i = 0; i < slots.length - 1; i++) {
    const endCurrent = toMins(slots[i].end_time);
    const startNext = toMins(slots[i+1].start_time);
    if (startNext > endCurrent) {
      break_start = slots[i].end_time;
      break_end = slots[i+1].start_time;
      break;
    }
  }
  return { start_time, end_time, duration_minutes, break_start, break_end };
}

/* ── Login ── */

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

/* ── Events List ── */

function renderEventsList() {
  const eventCards = state.events
    .map((ev) => {
      const openCount = ev.slot_count - ev.booked_count;
      const statsText =
        ev.slot_count > 0
          ? `${ev.slot_count} תורים · ${ev.booked_count} תפוסים · ${openCount} פנויים`
          : 'טרם הוגדרו תורים';
      return `
        <div class="card">
          <div class="event-card-header">
            <h2>${ev.name}</h2>
            <p class="muted">${statsText}</p>
          </div>
          <div class="actions-row">
            <button type="button" class="primary" data-manage="${ev.id}">ניהול</button>
            <button type="button" class="secondary" data-copy="${ev.slug}">העתקת קישור</button>
            <button type="button" class="secondary" data-rename="${ev.id}">שינוי שם</button>
            <button type="button" class="link" data-delete-event="${ev.id}">מחיקה</button>
          </div>
        </div>
      `;
    })
    .join('');

  app.innerHTML = `
    <div class="card">
      <h2>אירוע חדש</h2>
      ${state.formError ? `<p class="error">${state.formError}</p>` : ''}
      <form id="new-event-form">
        <label><span>שם האירוע</span><input type="text" name="name" placeholder="למשל: צילומי פרופיל — חברת אקמה" required /></label>
        <button type="submit" class="primary">יצירת אירוע</button>
      </form>
    </div>
    ${eventCards || '<p class="muted" style="text-align:center;padding:var(--space-8) 0;">אין אירועים עדיין. צרו את הראשון למעלה ↑</p>'}
  `;

  /* listeners */

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
    const created = await res.json();
    state.formError = null;
    /* auto-navigate to new event detail so user can set up slots immediately */
    state.currentEvent = { ...created, slot_count: 0, booked_count: 0 };
    state.view = 'event-detail';
    state.slots = [];
    state.bookings = [];
    state.showAddSlots = false;
    state.formError = null;
    state.formMessage = null;
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
      state.showAddSlots = false;
      const ok = await loadEventDetail(eventId);
      if (!ok) { render(); return; }
      render();
    });
  });

  app.querySelectorAll('[data-rename]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const eventId = btn.dataset.rename;
      const event = state.events.find((ev) => String(ev.id) === eventId);
      const newName = prompt('שם חדש לאירוע:', event.name);
      if (!newName || !newName.trim() || newName.trim() === event.name) return;
      const res = await fetch(`/api/admin/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (res.ok) { await loadEvents(); render(); }
    });
  });

  app.querySelectorAll('[data-delete-event]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const eventId = btn.dataset.deleteEvent;
      const event = state.events.find((ev) => String(ev.id) === eventId);
      if (!confirm(`למחוק את האירוע "${event.name}"?\nכל התורים וההזמנות יימחקו לצמיתות.`)) return;
      const res = await fetch(`/api/admin/events/${eventId}`, { method: 'DELETE', headers: authHeaders() });
      if (res.ok) { await loadEvents(); render(); }
    });
  });
}

/* ── Event Detail ── */

function renderEventDetail() {
  const ev = state.currentEvent;

  /* group slots by date */
  const slotsByDate = new Map();
  for (const s of state.slots) {
    if (!slotsByDate.has(s.date)) slotsByDate.set(s.date, []);
    slotsByDate.get(s.date).push(s);
  }

  const hasSlots = state.slots.length > 0;
  const totalSlots = state.slots.length;
  const bookedSlots = state.slots.filter((s) => s.is_booked).length;
  const openSlots = totalSlots - bookedSlots;

  /* slot creation / editing form (reusable) */
  const isEditing = !!state.editDate;
  const formTitle = isEditing ? `עריכת שעות ל-${formatDate(state.editDate)}` : 'הוספת תורים';
  const submitText = isEditing ? 'עדכון ושחזור תורים' : 'יצירת תורים';

  let start_time = '';
  let end_time = '';
  let duration_minutes = 15;
  let break_start = '';
  let break_end = '';

  if (isEditing) {
    const dateSlots = state.slots.filter(s => s.date === state.editDate);
    const params = getEventSlotsParams(dateSlots);
    if (params) {
      start_time = params.start_time;
      end_time = params.end_time;
      duration_minutes = params.duration_minutes;
      break_start = params.break_start;
      break_end = params.break_end;
    }
  }

  const slotsFormHtml = `
    <h3>${formTitle}</h3>
    ${state.formError ? `<p class="error">${state.formError}</p>` : ''}
    <form id="slots-form">
      <input type="hidden" name="overwrite" value="${isEditing ? 'true' : 'false'}" />
      <label><span>תאריך</span><input type="date" name="date" value="${isEditing ? state.editDate : ''}" ${isEditing ? 'readonly style="background:var(--color-bg); opacity:0.8;"' : ''} required /></label>
      <div class="form-row">
        <label><span>משעה</span><input type="time" name="start_time" value="${start_time}" required /></label>
        <label><span>עד שעה</span><input type="time" name="end_time" value="${end_time}" required /></label>
        <label><span>משך תור (דקות)</span><input type="number" name="duration_minutes" min="1" value="${duration_minutes}" required /></label>
      </div>
      <div class="form-row">
        <label><span>הפסקה מ- (אופציונלי)</span><input type="time" name="break_start" value="${break_start}" /></label>
        <label><span>הפסקה עד</span><input type="time" name="break_end" value="${break_end}" /></label>
      </div>
      <div class="actions-row">
        <button type="submit" class="primary">${submitText}</button>
        ${isEditing ? `<button type="button" class="secondary" id="cancel-edit-date">ביטול עריכה</button>` : ''}
      </div>
    </form>
  `;

  /* ---- Slots section ---- */
  let slotsSection = '';
  const showAddForm = state.showAddSlots || isEditing;

  if (!hasSlots) {
    /* first-time setup — form inline */
    slotsSection = `
      <div class="card">
        <h2>הגדרת תורים</h2>
        <p class="muted" style="margin-bottom:var(--space-4);">
          טרם הוגדרו תורים לאירוע הזה. בחרו תאריך, טווח שעות ומשך כל תור.
        </p>
        ${slotsFormHtml}
      </div>
    `;
  } else {
    /* chips grouped by date */
    let dateGroupsHtml = '';
    for (const [date, slots] of slotsByDate) {
      let chipsHtml = '';
      for (const s of slots) {
        if (s.is_booked) {
          chipsHtml += `<span class="slot-chip slot-chip--booked" title="${s.client_name || ''}">${s.start_time} · ${s.client_name || 'תפוס'}</span>`;
        } else {
          chipsHtml += `<span class="slot-chip slot-chip--open">${s.start_time}<button type="button" class="slot-chip__delete" data-delete-id="${s.id}" title="מחיקת תור">×</button></span>`;
        }
      }
      dateGroupsHtml += `
        <div class="slots-date-group">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-2);">
            <div class="slots-date-title" style="margin-bottom:0;">${formatDate(date)}</div>
            <button type="button" class="link small" data-edit-date="${date}" style="padding:2px var(--space-2);">עריכת שעות</button>
          </div>
          <div class="slots-chips">${chipsHtml}</div>
        </div>
      `;
    }

    slotsSection = `
      <div class="card">
        <div class="section-header">
          <h2>תורים</h2>
          <span class="muted">${totalSlots} סה״כ · ${bookedSlots} תפוסים · ${openSlots} פנויים</span>
        </div>
        ${state.formMessage ? `<p class="success-message">✓ ${state.formMessage}</p>` : ''}
        ${dateGroupsHtml}
        ${!isEditing ? `
          <div style="margin-top:var(--space-5);">
            <button type="button" class="secondary" id="toggle-add-slots">${state.showAddSlots ? '− סגירה' : '+ הוספת תורים'}</button>
          </div>
        ` : ''}
        ${showAddForm ? `<div class="add-slots-form">${slotsFormHtml}</div>` : ''}
      </div>
    `;
  }

  /* ---- Bookings section ---- */
  let bookingsSection = '';
  if (state.bookings.length > 0) {
    const rows = state.bookings
      .map(
        (b) => `
        <tr>
          <td>${formatDate(b.date)}<br><span class="muted">${b.start_time}–${b.end_time}</span></td>
          <td><strong>${b.client_name}</strong></td>
          <td>
            <label class="attended-label">
              <input type="checkbox" data-attended-id="${b.id}" ${b.attended ? 'checked' : ''} />
              <span>${b.attended ? 'הגיע/ה' : ''}</span>
            </label>
          </td>
          <td><button type="button" class="link" data-delete-booking-id="${b.id}">מחיקה</button></td>
        </tr>
      `
      )
      .join('');

    bookingsSection = `
      <div class="card">
        <div class="section-header" style="margin-bottom:var(--space-4);">
          <h2>הזמנות (${state.bookings.length})</h2>
          <button type="button" class="secondary small" id="export-excel-btn" style="padding: 6px 12px; font-size: var(--font-size-xs);">ייצוא ל-Excel</button>
        </div>
        <div class="table-responsive">
          <table>
            <thead><tr><th>מתי</th><th>שם</th><th>הגעה</th><th></th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
    `;
  } else if (hasSlots) {
    bookingsSection = `
      <div class="card">
        <h2>הזמנות</h2>
        <p class="muted">עדיין אין הזמנות. שתפו את הקישור כדי שלקוחות יקבעו תור.</p>
      </div>
    `;
  }

  /* ---- Full page ---- */
  app.innerHTML = `
    <button type="button" class="back-link" id="back-to-events">→ חזרה לרשימה</button>

    <div class="card">
      <div class="section-header">
        <h2>${ev.name}</h2>
        <div class="header-actions">
          <button type="button" class="secondary small" id="rename-event-detail">שינוי שם</button>
          <button type="button" class="link" id="delete-event-detail">מחיקה</button>
        </div>
      </div>
      <div class="share-row">
        <input type="text" readonly value="${bookingLink(ev.slug)}" id="share-link-input" />
        <button type="button" class="secondary small" id="copy-detail-link">העתקה</button>
      </div>
    </div>

    ${slotsSection}
    ${bookingsSection}
  `;

  /* ---- Listeners ---- */

  document.getElementById('back-to-events').addEventListener('click', async () => {
    state.view = 'events';
    state.currentEvent = null;
    state.showAddSlots = false;
    state.formMessage = null;
    await loadEvents();
    render();
  });

  document.getElementById('copy-detail-link').addEventListener('click', async (e) => {
    const input = document.getElementById('share-link-input');
    await navigator.clipboard.writeText(input.value);
    e.target.textContent = 'הועתק!';
    setTimeout(() => (e.target.textContent = 'העתקה'), 1500);
  });

  const exportBtn = document.getElementById('export-excel-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const bom = '\uFEFF';
      const headers = ['תאריך', 'שעת התחלה', 'שעת סיום', 'שם המשתתף', 'סטטוס הגעה'].join(',');
      const rows = state.bookings.map(b => {
        const dateStr = b.date;
        const start = b.start_time;
        const end = b.end_time;
        const name = `"${(b.client_name || '').replace(/"/g, '""')}"`;
        const attended = b.attended ? 'הגיע' : 'לא הגיע';
        return [dateStr, start, end, name, attended].join(',');
      });
      const csvContent = bom + [headers, ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bookings_${ev.slug}_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  document.getElementById('rename-event-detail').addEventListener('click', async () => {
    const newName = prompt('שם חדש לאירוע:', ev.name);
    if (!newName || !newName.trim() || newName.trim() === ev.name) return;
    const res = await fetch(`/api/admin/events/${ev.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ name: newName.trim() }),
    });
    if (res.ok) {
      state.currentEvent = { ...ev, name: newName.trim() };
      render();
    }
  });

  document.getElementById('delete-event-detail').addEventListener('click', async () => {
    if (!confirm(`למחוק את האירוע "${ev.name}"?\nכל התורים וההזמנות יימחקו לצמיתות.`)) return;
    const res = await fetch(`/api/admin/events/${ev.id}`, { method: 'DELETE', headers: authHeaders() });
    if (res.ok) {
      state.view = 'events';
      state.currentEvent = null;
      await loadEvents();
      render();
    }
  });

  const toggleBtn = document.getElementById('toggle-add-slots');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      state.showAddSlots = !state.showAddSlots;
      state.formError = null;
      render();
    });
  }

  document.querySelectorAll('.slot-chip__delete').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (!confirm('למחוק את התור הפנוי הזה?')) return;
      const res = await fetch(`/api/admin/slots/${btn.dataset.deleteId}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
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
      render();
    });
  });

  document.querySelectorAll('[data-delete-booking-id]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!confirm('למחוק את ההזמנה? התור יתפנה.')) return;
      const res = await fetch(`/api/admin/bookings/${btn.dataset.deleteBookingId}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (res.ok) {
        await loadEventDetail(ev.id);
        render();
      }
    });
  });

  app.querySelectorAll('[data-edit-date]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.editDate = btn.dataset.editDate;
      state.formError = null;
      state.formMessage = null;
      render();
      document.getElementById('slots-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });

  const cancelEditBtn = document.getElementById('cancel-edit-date');
  if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', () => {
      state.editDate = null;
      state.formError = null;
      state.formMessage = null;
      render();
    });
  }

  const slotsForm = document.getElementById('slots-form');
  if (slotsForm) {
    slotsForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.target).entries());

      // If overwriting, ask for confirmation if there are active bookings on that day
      if (data.overwrite === 'true') {
        const dateBookings = state.bookings.filter((b) => b.date === data.date);
        if (dateBookings.length > 0) {
          const proceed = confirm(`שים לב: יש כבר ${dateBookings.length} הזמנות לתאריך זה.\nעדכון ושחזור השעות ימחק את כל ההזמנות הקיימות לתאריך זה.\nהאם להמשיך?`);
          if (!proceed) return;
        }
      }

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
      state.formMessage = state.editDate 
        ? `השעות עודכנו ושוחזרו בהצלחה (${created.length} תורים).`
        : `נוצרו ${created.length} תורים בהצלחה.`;
      state.showAddSlots = false;
      state.editDate = null;
      await loadEventDetail(ev.id);
      render();
    });
  }
}

/* ── Render Router ── */

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

/* ── Init ── */

(async function init() {
  if (state.password) {
    const ok = await loadEvents();
    if (!ok) { render(); return; }
  }
  render();
})();

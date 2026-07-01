const app = document.getElementById('app');
const pageTitle = document.getElementById('page-title');
const pageSubtitle = document.getElementById('page-subtitle');

const eventSlug = new URLSearchParams(location.search).get('event');

const state = {
  event: null,
  slots: [],
  selectedSlotId: null,
  error: null,
  submitting: false,
  confirmed: null,
  invalidLink: false,
  view: 'book', // 'book' | 'registrants'
  registrants: null,
};

function formatDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' });
}

function groupByDate(slots) {
  const groups = new Map();
  for (const slot of slots) {
    if (!groups.has(slot.date)) groups.set(slot.date, []);
    groups.get(slot.date).push(slot);
  }
  return groups;
}

async function loadEventAndSlots() {
  if (!eventSlug) {
    state.invalidLink = true;
    return;
  }
  const eventRes = await fetch(`/api/events/${eventSlug}`);
  if (!eventRes.ok) {
    state.invalidLink = true;
    return;
  }
  state.event = await eventRes.json();

  const slotsRes = await fetch(`/api/events/${eventSlug}/slots`);
  state.slots = await slotsRes.json();
}

function render() {
  if (state.invalidLink) {
    app.innerHTML = '<div class="card"><p class="error">הקישור אינו תקין. נא לבדוק עם השולח ולנסות שוב.</p></div>';
    return;
  }

  pageTitle.textContent = `קביעת תור - ${state.event.name}`;
  pageSubtitle.textContent = 'בחרו תאריך ושעה פנויים, מלאו כמה פרטים ואנחנו נסמן לכם את התור.';

  const tabsHtml = `
    <div class="segmented-control-wrapper">
      <div class="segmented-control">
        <button type="button" class="control-btn ${state.view === 'book' ? 'active' : ''}" id="tab-book">קביעת תור</button>
        <button type="button" class="control-btn ${state.view === 'registrants' ? 'active' : ''}" id="tab-registrants">מי כבר נרשם</button>
      </div>
    </div>
  `;

  if (state.view === 'registrants' && !state.confirmed) {
    renderRegistrantsList(tabsHtml);
    return;
  }

  if (state.confirmed) {
    renderConfirmation();
    return;
  }

  const groups = groupByDate(state.slots);

  if (state.slots.length === 0) {
    app.innerHTML = tabsHtml + '<div class="card"><p class="muted">אין כרגע תורים פנויים. נסו לבדוק שוב מאוחר יותר.</p></div>';
    attachTabListeners();
    return;
  }

  let html = tabsHtml;
  for (const [date, slots] of groups) {
    html += `<div class="date-group card"><h2>${formatDate(date)}</h2><div class="slot-buttons">`;
    for (const slot of slots) {
      const selected = slot.id === state.selectedSlotId ? 'selected' : '';
      html += `<button type="button" class="slot ${selected}" data-slot-id="${slot.id}">${slot.start_time}</button>`;
    }
    html += '</div></div>';
  }

  if (state.selectedSlotId) {
    const slot = state.slots.find((s) => s.id === state.selectedSlotId);
    html += `
      <div class="card" id="booking-form-card">
        <h2>פרטים לתיאום התור (${formatDate(slot.date)}, ${slot.start_time})</h2>
        ${state.error ? `<p class="error">${state.error}</p>` : ''}
        <form id="booking-form">
          <label><span>שם מלא</span><input type="text" name="client_name" required autofocus /></label>
          <div class="actions-row">
            <button type="submit" class="primary" ${state.submitting ? 'disabled' : ''}>אישור קביעת תור</button>
            <button type="button" class="secondary" id="cancel-selection">ביטול</button>
          </div>
        </form>
      </div>
    `;
  }

  app.innerHTML = html;
  attachTabListeners();

  app.querySelectorAll('button.slot').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.selectedSlotId = Number(btn.dataset.slotId);
      state.error = null;
      render();
      document.getElementById('booking-form-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  const cancelBtn = document.getElementById('cancel-selection');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      state.selectedSlotId = null;
      state.error = null;
      render();
    });
  }

  const form = document.getElementById('booking-form');
  if (form) {
    form.addEventListener('submit', handleSubmit);
  }
}

function attachTabListeners() {
  const bookTab = document.getElementById('tab-book');
  const registrantsTab = document.getElementById('tab-registrants');
  if (bookTab) {
    bookTab.addEventListener('click', () => {
      state.view = 'book';
      render();
    });
  }
  if (registrantsTab) {
    registrantsTab.addEventListener('click', async () => {
      state.view = 'registrants';
      const res = await fetch(`/api/events/${eventSlug}/bookings`);
      state.registrants = await res.json();
      render();
    });
  }
}

function renderRegistrantsList(tabsHtml) {
  const rows = (state.registrants || [])
    .map(
      (b) => `
        <tr>
          <td>${formatDate(b.date)}</td>
          <td>${b.start_time}</td>
          <td>
            <strong>${b.client_name}</strong>
            <div style="display:inline-flex; gap:var(--space-2); margin-right:var(--space-3);">
              <button type="button" class="link" data-edit-booking="${b.id}" data-current-name="${b.client_name}" style="padding:0 var(--space-1); font-size:var(--font-size-xs); color:var(--color-text-secondary);">עריכה</button>
              <button type="button" class="link" data-cancel-booking="${b.id}" style="padding:0 var(--space-1); font-size:var(--font-size-xs);">ביטול</button>
            </div>
          </td>
        </tr>
      `
    )
    .join('');

  app.innerHTML = `
    ${tabsHtml}
    <div class="card">
      <h2>מי כבר נרשם</h2>
      <table>
        <thead><tr><th>תאריך</th><th>שעה</th><th>שם (ניתן לעריכה וביטול)</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="3" class="muted">אין נרשמים עדיין</td></tr>'}</tbody>
      </table>
    </div>
  `;
  attachTabListeners();

  app.querySelectorAll('[data-edit-booking]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const currentName = btn.dataset.currentName;
      const newName = prompt('שינוי שם הרשום:', currentName);
      if (!newName || !newName.trim() || newName.trim() === currentName) return;

      const res = await fetch(`/api/bookings/${btn.dataset.editBooking}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_name: newName.trim() })
      });

      if (res.ok) {
        const resBookings = await fetch(`/api/events/${eventSlug}/bookings`);
        state.registrants = await resBookings.json();
        render();
      } else {
        alert('משהו השתבש בעדכון השם.');
      }
    });
  });

  app.querySelectorAll('[data-cancel-booking]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('האם ברצונך לבטל את התור הזה?')) return;
      const res = await fetch(`/api/bookings/${btn.dataset.cancelBooking}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        const myBookingId = localStorage.getItem(`booking_${eventSlug}`);
        if (myBookingId && String(myBookingId) === String(btn.dataset.cancelBooking)) {
          localStorage.removeItem(`booking_${eventSlug}`);
        }
        await loadEventAndSlots();
        const resBookings = await fetch(`/api/events/${eventSlug}/bookings`);
        state.registrants = await resBookings.json();
        state.selectedSlotId = null;
        state.confirmed = null;
        render();
      } else {
        alert('משהו השתבש בביטול התור.');
      }
    });
  });
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function buildIcsContent({ eventName, date, startTime, endTime }) {
  const toIcsDateTime = (d, t) => `${d.replace(/-/g, '')}T${t.replace(':', '')}00`;
  const now = new Date();
  const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}T${pad(now.getHours())}${pad(
    now.getMinutes()
  )}${pad(now.getSeconds())}`;
  const uid = `${date}-${startTime}-${Math.random().toString(36).slice(2)}@photo-booking`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Photo Booking//HE',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${toIcsDateTime(date, startTime)}`,
    `DTEND:${toIcsDateTime(date, endTime)}`,
    `SUMMARY:צילומי פרופיל - ${eventName}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

function googleCalendarLink({ eventName, date, startTime, endTime }) {
  const toGoogleDateTime = (d, t) => `${d.replace(/-/g, '')}T${t.replace(':', '')}00`;
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `צילומי פרופיל - ${eventName}`,
    dates: `${toGoogleDateTime(date, startTime)}/${toGoogleDateTime(date, endTime)}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function renderConfirmation() {
  const { slot, client_name, event } = state.confirmed;
  const icsArgs = { eventName: event.name, date: slot.date, startTime: slot.start_time, endTime: slot.end_time };

  app.innerHTML = `
    <div class="card confirmation-card animated-fade-in">
      <div class="success-icon-wrapper">
        <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
          <circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
          <path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
        </svg>
      </div>
      <h2 class="confirmation-title">התור נקבע בהצלחה!</h2>
      <p class="confirmation-subtitle">נתראה בסטודיו ביום <strong>${formatDate(slot.date)}</strong> בשעה <strong>${slot.start_time}</strong>.</p>
      
      <div class="calendar-integration-box">
        <span class="integration-title">הוסיפו ליומן שלא תשכחו:</span>
        <div class="actions-row central-actions">
          <button type="button" class="btn-calendar ics" id="download-ics">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            הורדת תזכורת (ICS)
          </button>
          <a class="btn-calendar google" href="${googleCalendarLink(icsArgs)}" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24" width="16" height="16"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
            Google Calendar
          </a>
        </div>
      </div>
    </div>
    
    <div class="card prep-card animated-fade-in delay-1">
      <div class="prep-header">
        <span class="prep-icon">✨</span>
        <h3>איך מגיעים מוכנים לצילומים?</h3>
      </div>
      <div class="prep-items">
        <div class="prep-item">
          <div class="prep-item-number">1</div>
          <div class="prep-item-content">
            <strong>לבוש ייצוגי ונקי</strong>
            <p>חולצה חלקה בצבע אחיד (עדיף להימנע מצבעים זרחניים). ללא הדפסים, לוגואים גדולים או ציורים בולטים.</p>
          </div>
        </div>
        <div class="prep-item">
          <div class="prep-item-number">2</div>
          <div class="prep-item-content">
            <strong>שיער ומראה מסודר</strong>
            <p>סדרו את השיער והמראה הכללי כפי שתרצו להצטייר באופן מקצועי בתיק העבודות או באתר החברה.</p>
          </div>
        </div>
      </div>
      <div class="prep-footer">
        <p>הצילום עצמו קצר וקל — פשוט תגיעו עם חיוך ואנחנו נדאג לכל השאר.</p>
      </div>
    </div>
  `;

  document.getElementById('download-ics').addEventListener('click', () => {
    const blob = new Blob([buildIcsContent(icsArgs)], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'photo-session.ics';
    a.click();
    URL.revokeObjectURL(url);
  });
}

async function handleSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form).entries());



  state.submitting = true;
  state.error = null;
  render();

  try {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slot_id: state.selectedSlotId, ...data }),
    });
    const body = await res.json();

    if (!res.ok) {
      if (res.status === 409) {
        state.error = 'מצטערים, מישהו אחר כבר תפס את התור הזה. נא לבחור שעה אחרת.';
        state.selectedSlotId = null;
        const slotsRes = await fetch(`/api/events/${eventSlug}/slots`);
        state.slots = await slotsRes.json();
      } else {
        state.error = body.error || 'משהו השתבש, נסו שוב.';
      }
      state.submitting = false;
      render();
      return;
    }

    state.confirmed = body;
    localStorage.setItem(`booking_${eventSlug}`, body.id);
    render();
  } catch (err) {
    state.error = 'משהו השתבש, נסו שוב.';
    state.submitting = false;
    render();
  }
}

(async function init() {
  await loadEventAndSlots();
  render();
})();

const app = document.getElementById('app');
const eventSlug = new URLSearchParams(location.search).get('event');

const state = {
  event: null,
  slots: [],
  dates: [],
  selectedDate: null,
  selectedSlotId: null,
  error: null,
  submitting: false,
  confirmed: null,
  invalidLink: false,
  view: 'book', // 'book' | 'registrants'
  registrants: null,
};

/* ── Helpers ── */

function formatDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' });
}

function formatDateShort(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('he-IL', { day: 'numeric', month: 'short' });
}

function getDayNameShort(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDay();
  const days = ['א\'', 'ב\'', 'ג\'', 'ד\'', 'ה\'', 'ו\'', 'ש\''];
  return days[day];
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

  /* extract unique dates */
  const uniqueDates = [...new Set(state.slots.map(s => s.date))].sort();
  state.dates = uniqueDates;
  if (uniqueDates.length > 0 && !state.selectedDate) {
    state.selectedDate = uniqueDates[0];
  }
}

/* ── Rendering ── */

function render() {
  if (state.invalidLink) {
    app.innerHTML = `
      <div class="error-container animated-fade-in" style="max-width:480px; margin:80px auto; text-align:center;">
        <div class="card" style="padding:var(--space-6);">
          <p class="error" style="margin:0;">הקישור שברשותך אינו תקין. אנא פנה למנהל האירוע לקבלת קישור מעודכן.</p>
        </div>
      </div>
    `;
    return;
  }

  if (!state.event) return;

  /* Tabs segmented control */
  const tabsHtml = `
    <div class="segmented-control-wrapper">
      <div class="segmented-control">
        <button type="button" class="control-btn ${state.view === 'book' ? 'active' : ''}" id="tab-book">קביעת תור</button>
        <button type="button" class="control-btn ${state.view === 'registrants' ? 'active' : ''}" id="tab-registrants">מי כבר נרשם</button>
      </div>
    </div>
  `;

  let mainPanelHtml = '';

  if (state.view === 'registrants' && !state.confirmed) {
    mainPanelHtml = renderRegistrantsListPanel(tabsHtml);
  } else if (state.confirmed) {
    mainPanelHtml = renderConfirmationPanel();
  } else {
    mainPanelHtml = renderBookingPanel(tabsHtml);
  }

  /* Sidebar info card */
  const sidebarHtml = renderSidebarCard();

  /* Main Grid Layout */
  app.innerHTML = `
    <div class="booking-grid-layout animated-fade-in">
      <div class="booking-main-panel">
        ${mainPanelHtml}
      </div>
      <div class="booking-sidebar-panel">
        ${sidebarHtml}
      </div>
    </div>
  `;

  attachTabListeners();
  attachBookingListeners();
}

/* ── Panels Generators ── */

function renderBookingPanel(tabsHtml) {
  if (state.slots.length === 0) {
    return `
      ${tabsHtml}
      <div class="card" style="text-align:center; padding:var(--space-8) var(--space-4);">
        <svg viewBox="0 0 24 24" width="48" height="48" stroke="var(--color-text-muted)" stroke-width="1.5" fill="none" style="margin-bottom:var(--space-3);"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        <h3 style="color:var(--color-primary); margin-bottom:var(--space-2);">אין תורים פנויים</h3>
        <p class="muted">כרגע לא הוגדרו שעות פנויות לאירוע זה. אנא בדקו שוב מאוחר יותר.</p>
      </div>
    `;
  }

  const sortedSlots = [...state.slots].sort((a, b) => a.start_time.localeCompare(b.start_time));

  /* Booking form card */
  let formCardHtml = '';
  if (state.selectedSlotId) {
    const slot = state.slots.find(s => s.id === state.selectedSlotId);
    formCardHtml += `
      <div class="card booking-form-card animated-fade-in" id="booking-form-card" style="margin-top:var(--space-5);">
        <h2>פרטים לתיאום התור</h2>
        <p class="muted" style="margin-bottom:var(--space-4);">
          קביעת תור ליום <strong>${formatDate(slot.date)}</strong> בשעה <strong>${slot.start_time}</strong>.
        </p>
        ${state.error ? `<p class="error">${state.error}</p>` : ''}
        <form id="booking-form">
          <label><span>שם מלא</span><input type="text" name="client_name" placeholder="הקלידו את שמכם" required autofocus /></label>
          <div class="actions-row" style="margin-top:var(--space-4);">
            <button type="submit" class="primary" ${state.submitting ? 'disabled' : ''}>אישור קביעת תור</button>
            <button type="button" class="secondary" id="cancel-selection">ביטול</button>
          </div>
        </form>
      </div>
    `;
  }

  return `
    ${tabsHtml}
    <div class="card booking-selector-card">
      <div class="card-inner-header" style="margin-bottom:var(--space-5);">
        <h2>בחירת שעה לצילום</h2>
        <p class="muted">בחרו את השעה הנוחה לכם מתוך השעות הפנויות ביומן.</p>
      </div>

      <div class="slots-container-box">
        <div class="slot-buttons">
          ${sortedSlots.map(s => {
            const selected = s.id === state.selectedSlotId ? 'selected' : '';
            return `<button type="button" class="slot ${selected}" data-slot-id="${s.id}">${s.start_time}</button>`;
          }).join('')}
        </div>
      </div>
    </div>

    ${formCardHtml}
  `;
}

function renderRegistrantsListPanel(tabsHtml) {
  const rows = (state.registrants || [])
    .map(
      (b) => `
        <tr>
          <td>${formatDateShort(b.date)}</td>
          <td>${b.start_time}</td>
          <td>
            <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
              <strong>${b.client_name}</strong>
              <div style="display:inline-flex; gap:6px;">
                <button type="button" class="link" data-edit-booking="${b.id}" data-current-name="${b.client_name}" style="padding:0 6px; font-size:var(--font-size-xs); color:var(--color-text-secondary);">עריכה</button>
                <button type="button" class="link" data-cancel-booking="${b.id}" style="padding:0 6px; font-size:var(--font-size-xs);">ביטול</button>
              </div>
            </div>
          </td>
        </tr>
      `
    )
    .join('');

  return `
    ${tabsHtml}
    <div class="card">
      <div class="card-inner-header" style="margin-bottom:var(--space-4);">
        <h2>רשימת המשתתפים שנרשמו</h2>
        <p class="muted">ניתן לשנות שם או לבטל תור שנרשם במידת הצורך ישירות מהרשימה.</p>
      </div>
      <div class="table-responsive">
        <table>
          <thead><tr><th>תאריך</th><th>שעה</th><th>שם המשתתף</th></tr></thead>
          <tbody>${rows || '<tr><td colspan="3" class="muted" style="text-align:center;">אין נרשמים עדיין לתאריך זה.</td></tr>'}</tbody>
        </table>
      </div>
    </div>
  `;
}

function renderConfirmationPanel() {
  const { slot, client_name, event } = state.confirmed;
  const icsArgs = { eventName: event.name, date: slot.date, startTime: slot.start_time, endTime: slot.end_time };

  return `
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
  `;
}

function renderSidebarCard() {
  return `
    <div class="studio-sidebar-card" style="padding: var(--space-6) var(--space-5);">
      <div style="text-align:center; margin-bottom:var(--space-4);">
        <svg class="doodle-camera animate-fade-in" viewBox="0 0 200 200" width="140" height="140" style="margin: 0 auto; display: block;">
          <!-- Offset Color Fills -->
          <rect x="42" y="62" width="110" height="80" rx="16" fill="var(--color-accent-purple)" opacity="0.95" />
          <rect x="75" y="38" width="40" height="20" rx="4" fill="var(--color-accent-lime)" opacity="0.95" />
          <circle cx="97" cy="102" r="32" fill="#ffffff" />
          
          <!-- Outlines -->
          <rect x="45" y="60" width="110" height="80" rx="16" fill="none" stroke="var(--color-primary)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
          <rect x="80" y="40" width="40" height="20" rx="4" fill="none" stroke="var(--color-primary)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M 55,60 L 55,50 L 67,50 L 67,60" fill="none" stroke="var(--color-primary)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
          <circle cx="100" cy="100" r="30" fill="none" stroke="var(--color-primary)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
          <circle cx="100" cy="100" r="18" fill="none" stroke="var(--color-primary)" stroke-width="3" stroke-dasharray="4 2" />
          
          <!-- smiley face -->
          <circle cx="92" cy="96" r="3" fill="var(--color-primary)" />
          <circle cx="108" cy="96" r="3" fill="var(--color-primary)" />
          <path d="M 94,106 Q 100,112 106,106" fill="none" stroke="var(--color-primary)" stroke-width="3" stroke-linecap="round" />
          
          <!-- Waving Arms -->
          <path d="M 45,95 Q 25,85 15,95 Q 10,100 15,105 Q 25,100 45,100" fill="none" stroke="var(--color-primary)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M 155,95 Q 175,80 185,60 Q 190,55 183,50 Q 175,60 155,90" fill="none" stroke="var(--color-primary)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
          
          <!-- Legs -->
          <path d="M 80,140 L 80,170 Q 75,175 65,175" fill="none" stroke="var(--color-primary)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M 120,140 L 120,170 Q 125,175 135,175" fill="none" stroke="var(--color-primary)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
          <line x1="50" y1="175" x2="150" y2="175" stroke="var(--color-primary)" stroke-width="4" stroke-linecap="round" />
        </svg>
      </div>
      
      <div class="sidebar-content" style="padding:0; text-align:right;">
        <h3 class="sidebar-title" style="text-align:center; font-size:var(--font-size-xl); margin-bottom:var(--space-4);">${state.event.name}</h3>

        <div class="sidebar-prep-tips" style="border-top:1px solid var(--color-border-light); padding-top:var(--space-4);">
          <h4 style="font-size:var(--font-size-md); margin-bottom:var(--space-3); color:var(--color-primary);">הנחיות הגעה וצילום:</h4>
          <ul class="prep-bullet-list">
            <li>
              <strong>לבוש ייצוגי ונקי</strong>
              <span>חולצה חלקה בצבע אחיד, ללא הדפסים, לוגואים בולטים או ציורים שיכולים להסיח את הדעת בתמונה.</span>
            </li>
            <li>
              <strong>שיער ומראה מסודר</strong>
              <span>סדרו את השיער והמראה הכללי כפי שתרצו להצטייר באופן מקצועי ואינטליגנטי.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  `;
}

/* ── Event Listeners & Logic ── */

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

function attachBookingListeners() {
  /* date chip click */
  app.querySelectorAll('[data-carousel-date]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.selectedDate = btn.dataset.carouselDate;
      state.selectedSlotId = null;
      state.error = null;
      render();
    });
  });

  /* time slot button click */
  app.querySelectorAll('button.slot').forEach(btn => {
    btn.addEventListener('click', () => {
      state.selectedSlotId = Number(btn.dataset.slotId);
      state.error = null;
      render();
      document.getElementById('booking-form-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });

  /* cancel selection */
  const cancelBtn = document.getElementById('cancel-selection');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      state.selectedSlotId = null;
      state.error = null;
      render();
    });
  }

  /* form submit */
  const form = document.getElementById('booking-form');
  if (form) {
    form.addEventListener('submit', handleSubmit);
  }

  /* download ics confirmation listener */
  const downloadIcsBtn = document.getElementById('download-ics');
  if (downloadIcsBtn && state.confirmed) {
    const { slot, event } = state.confirmed;
    const icsArgs = { eventName: event.name, date: slot.date, startTime: slot.start_time, endTime: slot.end_time };
    downloadIcsBtn.addEventListener('click', () => {
      const blob = new Blob([buildIcsContent(icsArgs)], { type: 'text/calendar' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'photo-session.ics';
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  /* public list edit booking */
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

  /* public list cancel booking */
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

/* ── Calendar Generators ── */

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

/* ── Initialization ── */

(async function init() {
  await loadEventAndSlots();
  render();
})();

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
    <div class="actions-row" style="justify-content:center; margin-bottom:16px;">
      <button type="button" class="${state.view === 'book' ? 'primary' : 'secondary'}" id="tab-book">קביעת תור</button>
      <button type="button" class="${state.view === 'registrants' ? 'primary' : 'secondary'}" id="tab-registrants">מי כבר נרשם</button>
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
        <td>${b.client_name}</td>
      </tr>
    `
    )
    .join('');

  app.innerHTML = `
    ${tabsHtml}
    <div class="card">
      <h2>מי כבר נרשם</h2>
      <table>
        <thead><tr><th>תאריך</th><th>שעה</th><th>שם</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="3" class="muted">אין נרשמים עדיין</td></tr>'}</tbody>
      </table>
    </div>
  `;
  attachTabListeners();
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
    <div class="card confirmation">
      <h2>התור נקבע בהצלחה!</h2>
      <p>${client_name}, נתראה ב-${formatDate(slot.date)} בשעה ${slot.start_time}.</p>
      <div class="actions-row" style="justify-content:center">
        <button type="button" class="secondary" id="download-ics">הוספה ליומן (ICS)</button>
        <a class="secondary" style="text-decoration:none; display:inline-block" href="${googleCalendarLink(
          icsArgs
        )}" target="_blank" rel="noopener">Google Calendar</a>
      </div>
    </div>
    <div class="card prep-tips">
      <h2>איך מגיעים מוכנים? 📸</h2>
      <ul>
        <li><strong>לבוש ייצוגי ונקי</strong> — חולצה חלקה בצבע אחיד, ללא הדפסים, לוגואים או ציורים בולטים.</li>
        <li><strong>שיער מסודר</strong> — כפי שתרצו להיראות באופן מקצועי. זה הזמן להגיע עם הלוק שמייצג אתכם.</li>
      </ul>
      <p class="muted">הצילום עצמו קצר וקל — פשוט תגיעו עם חיוך ואנחנו נדאג לכל השאר.</p>
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

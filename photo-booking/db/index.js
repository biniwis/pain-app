const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const dbPath = path.join(__dirname, '..', 'data', 'booking.db');

// Ensure folder exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Download database from Supabase at startup
async function initDatabase() {
  const supabaseUrl = process.env.SUPABASE_URL || 'https://tnjxweirnjaidbhbdlyw.supabase.co';
  const supabaseKey = process.env.SUPABASE_KEY || 'sb_secret_7Gwn0cSnwHLcxe8ZLYytYQ_IAoTcEen';
  const bucket = process.env.SUPABASE_BUCKET || 'database';

  if (supabaseUrl && supabaseKey) {
    console.log('Downloading database from Supabase Storage...');
    try {
      const url = `${supabaseUrl}/storage/v1/object/authenticated/${bucket}/booking.db`;
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${supabaseKey}`
        }
      });
      if (res.ok) {
        const buffer = await res.arrayBuffer();
        fs.writeFileSync(dbPath, Buffer.from(buffer));
        console.log('Database downloaded successfully from Supabase.');
      } else {
        console.log('No existing database found on Supabase storage (or bucket empty). Starting fresh.');
      }
    } catch (err) {
      console.error('Failed to download database from Supabase:', err);
    }
  } else {
    console.log('Supabase sync not configured. Running with local database.');
  }
}

// Open Database
const db = new Database(dbPath);
// Use DELETE mode so SQLite writes directly to booking.db and does not use WAL files
// (which makes fs.watch trigger reliably on booking.db changes!)
db.pragma('journal_mode = DELETE');

// Create schema
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
db.exec(schema);

// Watch database file changes to auto-backup
const supabaseUrl = process.env.SUPABASE_URL || 'https://tnjxweirnjaidbhbdlyw.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'sb_secret_7Gwn0cSnwHLcxe8ZLYytYQ_IAoTcEen';
const bucket = process.env.SUPABASE_BUCKET || 'database';

if (supabaseUrl && supabaseKey) {
  let uploadTimeout = null;

  fs.watch(dbPath, (eventType) => {
    if (eventType === 'change') {
      if (uploadTimeout) clearTimeout(uploadTimeout);
      
      // Debounce upload by 2 seconds to group multiple writes
      uploadTimeout = setTimeout(async () => {
        console.log('Uploading database backup to Supabase Storage...');
        try {
          const fileBuffer = fs.readFileSync(dbPath);
          const url = `${supabaseUrl}/storage/v1/object/${bucket}/booking.db`;
          
          const res = await fetch(url, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/octet-stream',
              'x-upsert': 'true'
            },
            body: fileBuffer
          });
          
          if (res.ok) {
            console.log('Database backup uploaded successfully to Supabase.');
          } else {
            const errText = await res.text();
            console.error('Failed to upload database backup to Supabase:', errText);
          }
        } catch (err) {
          console.error('Error uploading database backup:', err);
        }
      }, 2000);
    }
  });
}

module.exports = db;
module.exports.initDatabase = initDatabase;

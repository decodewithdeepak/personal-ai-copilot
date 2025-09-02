const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database connection
const dbPath = process.env.DATABASE_URL?.replace('sqlite:', '') || './ai_copilot.db';
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ SQLite connection error:', err);
    } else {
        console.log('✅ Connected to SQLite database');
    }
});

// Promisify database methods
const query = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve({ rows });
            }
        });
    });
};

const run = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve({
                    lastID: this.lastID,
                    changes: this.changes,
                    rows: [{ id: this.lastID }]
                });
            }
        });
    });
};

module.exports = {
    query,
    run,
    db
};

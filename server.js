const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3002;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors()); // Enable CORS for all routes

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Route to serve the index.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Connect to SQLite Database (NEW)
let db = new sqlite3.Database('crm_database_UPDATED.db', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the SQLite database.');
});

// Create Tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS "Users" (
	"userID"	INTEGER,
	"firstName"	TEXT,
	"lastName"	TEXT,
	"email"	REAL,
	"phone"	NUMERIC,
	"address"	TEXT,
	"city"	TEXT,
	"state"	TEXT,
	"country"	TEXT,
	"postcode"	TEXT,
	"username"	TEXT,
	"password"	TEXT,
	"role"	TEXT,
	"createdAt"	TEXT,
	"departmendName"	TEXT,
	"businessID"	INTEGER,
	PRIMARY KEY("userID" AUTOINCREMENT),
	FOREIGN KEY("businessID") REFERENCES "Businesses"("businessID")
)`);


db.get('SELECT COUNT(*) AS count FROM Users', (err, row) => {
  if (err) {
    return console.error(err.message);
  }
  if (row.count === 0) {
    insertDummyData();
  }
});
});


const insertDummyData = () => {
  const stmt = db.prepare(`INSERT INTO Users (
    firstName, lastName, email, phone, address, city, state, country, postcode,
    username, password, role, createdAt
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  
  for (let i = 1; i <= 50; i++) {
    stmt.run(
      `First${i}`, `Last${i}`, `email${i}@example.com`, `1234567890`, `Address${i}`,
      `City${i}`, `State${i}`, `Country${i}`, `Postcode${i}`, `username${i}`,
      `password${i}`, `User`, new Date().toISOString()
    );
  }

  stmt.finalize();
};

// Route to handle user login
// Routes for different user roles
// CRUD operations for Entities

// Get all entities
app.get('/Users', (req, res) => {
    db.all('SELECT * FROM Users', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Get a single entity
app.get('/Users/:id', (req, res) => {
    db.get('SELECT * FROM Users WHERE userID = ?', [req.params.id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(row || {});
    });
});

// Create a new entity
app.post('/Users', (req, res) => {
  const {
      firstName, lastName, email, phone, address, city, state, country, postcode,
      username, password, role
  } = req.body;
  const createdAt = new Date().toISOString();
  
  // Prepare the SQL statement
  const stmt = db.prepare(`INSERT INTO Users (
      firstName, lastName, email, phone, address, city, state, country, postcode,
      username, password, role, createdAt
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  
  // Execute the SQL statement
  stmt.run([
      firstName, lastName, email, phone, address, city, state, country, postcode,
      username, password, role, createdAt
  ], function (err) {
      if (err) {
          console.error('Error saving entity:', err.message); // Log the error
          return res.status(500).json({ success: false, message: 'Error creating entity' });
      }
      res.json({ success: true, entityID: this.lastID });
  });
  
  // Finalize the statement
  stmt.finalize();
});

// Update an existing entity
app.put('/Users/:id', (req, res) => {
    const { firstName, lastName, email, phone, address, city, state, country, postcode, username, password, role } = req.body;
    const stmt = db.prepare(`UPDATE Users SET
        firstName = ?, lastName = ?, email = ?, phone = ?, address = ?, city = ?, state = ?, country = ?, postcode = ?, username = ?, password = ?, role = ?
        WHERE userID = ?`);
    stmt.run([firstName, lastName, email, phone, address, city, state, country, postcode, username, password, role, req.params.id], function (err) {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error updating entity' });
        }
        res.json({ success: true, changes: this.changes });
    });
    stmt.finalize();
});

// Delete an entity
app.delete('/Users/:id', (req, res) => {
    const stmt = db.prepare('DELETE FROM Users WHERE UserID = ?');
    stmt.run([req.params.id], function (err) {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error deleting entity' });
        }
        res.json({ success: true, changes: this.changes });
    });
    stmt.finalize();
});

// Start the Server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

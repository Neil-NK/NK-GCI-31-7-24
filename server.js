const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Route to serve the index.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Connect to SQLite Database
let db = new sqlite3.Database('crm_database_UPDATED.db', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the SQLite database.');
});

/* ************************************************** 
     ****************CREATE TABLES ******************
     ************************************************ */ 

// Create Tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS "Users" (
    "userID" INTEGER,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" REAL,
    "phone" NUMERIC,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "postcode" TEXT,
    "username" TEXT,
    "password" TEXT,
    "role" TEXT,
    "createdAt" TEXT,
    "departmentName" TEXT,
    "businessID" INTEGER,
    PRIMARY KEY("userID" AUTOINCREMENT),
    FOREIGN KEY("businessID") REFERENCES "Businesses"("businessID")
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS "Businesses" (
    "businessID" INTEGER,
    "businessName" TEXT,
    "contactType" TEXT,
    "contactDate" TEXT,
    "notes" TEXT,
    "createdAt" TEXT,
    "userID" INTEGER,
    PRIMARY KEY("businessID" AUTOINCREMENT),
    FOREIGN KEY("userID") REFERENCES "Users"("userID")
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS "Logs" (
    "logID" INTEGER,
    "businessID" INTEGER,
    "userID" INTEGER,
    "logDate" TEXT,
    "logType" TEXT,
    "notes" TEXT,
    "createdAt" TEXT,
    PRIMARY KEY("logID" AUTOINCREMENT),
    FOREIGN KEY("businessID") REFERENCES "Businesses"("businessID"),
    FOREIGN KEY("userID") REFERENCES "Users"("userID")
  )`);



  /* ************************************************** 
     ******ADD INITIAL DATA IF TABLES EMPTY ***********
     ************************************************** */ 

  // Add initial dummy data if tables are empty
  db.get('SELECT COUNT(*) AS count FROM Users', (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    if (row.count === 0) {
      addDummyUserData();
    }
  });

  db.get('SELECT COUNT(*) AS count FROM Businesses', (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    if (row.count === 0) {
      addDummyBusinessData();
    }
  });

  
  db.get('SELECT COUNT(*) AS count FROM Logs', (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    if (row.count === 0) {
      addDummyLogsData();
    }
  });
});


/* ************************************************** 
     ****************ADD DUMMY DATA *******************
     ************************************************** */ 

// Function to add dummy user data from CSV
const addDummyUserData = () => {
  const filePath = path.join(__dirname, 'dummy_data', 'dummy_user_data.csv');
  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {
      const { firstName, lastName, email, phone, address, city, state, country, postcode, username, password, role, createdAt } = row;
      const stmt = db.prepare(`INSERT INTO Users (
        firstName, lastName, email, phone, address, city, state, country, postcode,
        username, password, role, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

      stmt.run([firstName, lastName, email, phone, address, city, state, country, postcode, username, password, role, createdAt]);
      stmt.finalize();
    })
    .on('end', () => {
      console.log('Dummy user data added successfully.');
    });
};

// Route to trigger the addition of dummy user data
app.post('/addDummyUserData', (req, res) => {
  addDummyUserData();
  res.json({ success: true, message: 'Dummy user data is being added.' });
});

// Function to add small dummy user data from CSV
const addSmallDummyUserData = () => {
  const filePath = path.join(__dirname, 'dummy_data', 'small_dummy_user_data.csv');
  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {
      const { firstName, lastName, email, phone, address, city, state, country, postcode, username, password, role, createdAt, businessID, departmentName } = row;
      const stmt = db.prepare(`INSERT INTO Users (
        firstName, lastName, email, phone, address, city, state, country, postcode,
        username, password, role, createdAt, businessID, departmentName
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

      stmt.run([firstName, lastName, email, phone, address, city, state, country, postcode, username, password, role, createdAt, businessID, departmentName]);
      stmt.finalize();
    })
    .on('end', () => {
      console.log('Small dummy user data added successfully.');
    });
};

// Route to trigger the addition of small dummy user data
app.post('/addSmallDummyUserData', (req, res) => {
  addSmallDummyUserData();
  res.json({ success: true, message: 'Small dummy user data is being added.' });
});



// Function to add dummy business data from CSV
const addDummyBusinessData = () => {
  const filePath = path.join(__dirname, 'dummy_data', 'dummy_business_data.csv');
  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {
      const { businessName, contactType, contactDate, notes, createdAt } = row;
      const stmt = db.prepare(`INSERT INTO Businesses (
        businessName, contactType, contactDate, notes, createdAt
      ) VALUES (?, ?, ?, ?, ?)`);

      stmt.run([businessName, contactType, contactDate, notes, createdAt]);
      stmt.finalize();
    })
    .on('end', () => {
      console.log('Dummy business data added successfully.');
    });
};

// Route to trigger the addition of dummy business data
app.post('/addDummyBusinessData', (req, res) => {
  addDummyBusinessData();
  res.json({ success: true, message: 'Dummy business data is being added.' });
});

// Function to add small dummy business data from CSV
const addSmallDummyBusinessData = () => {
  const filePath = path.join(__dirname, 'dummy_data', 'small_dummy_business_data.csv');
  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {
      const { businessName, contactType, contactDate, notes, createdAt } = row;
      const stmt = db.prepare(`INSERT INTO Businesses (
        businessName, contactType, contactDate, notes, createdAt
      ) VALUES (?, ?, ?, ?, ?)`);

      stmt.run([businessName, contactType, contactDate, notes, createdAt]);
      stmt.finalize();
    })
    .on('end', () => {
      console.log('Small dummy business data added successfully.');
    });
};

// Route to trigger the addition of small dummy business data
app.post('/addSmallDummyBusinessData', (req, res) => {
  addSmallDummyBusinessData();
  res.json({ success: true, message: 'Small dummy business data is being added.' });
});

// Function to add dummy logs data from CSV
const addDummyLogsData = () => {
  const filePath = path.join(__dirname, 'dummy_data', 'dummy_logs_data.csv');
  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {
      const { businessID, userID, logDate, logType, notes, createdAt } = row;
      const stmt = db.prepare(`INSERT INTO Logs (
        businessID, userID, logDate, logType, notes, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?)`);

      stmt.run([businessID, userID, logDate, logType, notes, createdAt]);
      stmt.finalize();
    })
    .on('end', () => {
      console.log('Small dummy user data added successfully.');
    });
};


// Route to trigger the addition of dummy logs data
app.post('/addDummyLogsData', (req, res) => {
  addDummyLogsData();
  res.json({ success: true, message: 'Dummy logs data is being added.' });
});



// Function to add small dummy user data from CSV
const addSmallDummyLogsData = () => {
  const filePath = path.join(__dirname, 'dummy_data', 'small_dummy_logs_data.csv');
  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {
      const { businessID, userID, logDate, logType, notes, createdAt } = row;
      const stmt = db.prepare(`INSERT INTO Logs (
        businessID, userID, logDate, logType, notes, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?)`);

      stmt.run([businessID, userID, logDate, logType, notes, createdAt]);
      stmt.finalize();
    })
    .on('end', () => {
      console.log('Small dummy user data added successfully.');
    });
};


// Route to trigger the addition of small dummy logs data
app.post('/addSmallDummyLogsData', (req, res) => {
  addSmallDummyLogsData();
  res.json({ success: true, message: 'Small dummy logs data is being added.' });
});






/* ************************************************** 
     **************** GETTING DATA *******************
     ************************************************** */ 

// Get all users with their associated business names
app.get('/UsersWithBusiness', (req, res) => {
  const query = `
    SELECT Users.*, Businesses.businessName
    FROM Users
    LEFT JOIN Businesses ON Users.businessID = Businesses.businessID
  `;
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get all logs with their associated business names and user names
app.get('/LogsWithDetails', (req, res) => {
  const query = `
    SELECT Logs.logID, Logs.logDate, Logs.logType, Logs.notes, Logs.createdAt,
           Businesses.businessName, 
           Users.firstName, Users.lastName
    FROM Logs
    LEFT JOIN Businesses ON Logs.businessID = Businesses.businessID
    LEFT JOIN Users ON Logs.userID = Users.userID
  `;
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});


// Get all users
app.get('/Users', (req, res) => {
  db.all('SELECT * FROM Users', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get all businesses
app.get('/Businesses', (req, res) => {
  db.all('SELECT * FROM Businesses', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get all logs
app.get('/Logs', (req, res) => {
  db.all('SELECT * FROM Logs', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get all logs with their associated business names and user names
app.get('/LogsWithBusinessNames', (req, res) => {
  const query = `
    SELECT Users.*, Businesses.businessName
    FROM Users
    LEFT JOIN Businesses ON Users.businessID = Businesses.businessID
  `;
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get a single User
app.get('/Users/:id', (req, res) => {
  db.get('SELECT * FROM Users WHERE userID = ?', [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(row || {});
  });
});

// Get a single Business
app.get('/Businesses/:id', (req, res) => {
  db.get('SELECT * FROM Businesses WHERE businessID = ?', [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(row || {});
  });
});

// Get a single Log
app.get('/logs/:id', (req, res) => {
  db.get('SELECT * FROM Logs WHERE logID = ?', [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(row || {});
  });
});

// Create a new User
app.post('/Users', (req, res) => {
  const {
    firstName, lastName, email, phone, address, city, state, country, postcode,
    username, password, role
  } = req.body;
  const createdAt = new Date().toISOString();

  const stmt = db.prepare(`INSERT INTO Users (
    firstName, lastName, email, phone, address, city, state, country, postcode,
    username, password, role, createdAt
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

  stmt.run([
    firstName, lastName, email, phone, address, city, state, country, postcode,
    username, password, role, createdAt
  ], function (err) {
    if (err) {
      console.error('Error saving user:', err.message);
      return res.status(500).json({ success: false, message: 'Error creating user' });
    }
    res.json({ success: true, UserID: this.lastID });
  });

  stmt.finalize();
});

// Create a new Business
app.post('/Businesses', (req, res) => {
  const {
    businessName, contactType, contactDate, notes
  } = req.body;
  const createdAt = new Date().toISOString();

  const stmt = db.prepare(`INSERT INTO Businesses (
    businessName, contactType, contactDate, notes, createdAt
  ) VALUES (?, ?, ?, ?, ?)`);

  stmt.run([businessName, contactType, contactDate, notes, createdAt], function (err) {
    if (err) {
      console.error('Error saving business:', err.message);
      return res.status(500).json({ success: false, message: 'Error creating business' });
    }
    res.json({ success: true, BusinessID: this.lastID });
  });

  stmt.finalize();
});

// Create a new Log
app.post('/logs', (req, res) => {
  const {
    businessID, userID, logDate, logType, notes
  } = req.body;
  const createdAt = new Date().toISOString();

  const stmt = db.prepare(`INSERT INTO Logs (
    businessID, userID, logDate, logType, notes, createdAt
  ) VALUES (?, ?, ?, ?, ?, ?)`);

  stmt.run([businessID, userID, logDate, logType, notes, createdAt], function (err) {
    if (err) {
      console.error('Error saving log:', err.message);
      return res.status(500).json({ success: false, message: 'Error creating log' });
    }
    res.json({ success: true, logID: this.lastID });
  });

  stmt.finalize();
});


// Update an existing user
app.put('/Users/:id', (req, res) => {
  const { firstName, lastName, email, phone, address, city, state, country, postcode, username, password, role } = req.body;
  const stmt = db.prepare(`UPDATE Users SET
    firstName = ?, lastName = ?, email = ?, phone = ?, address = ?, city = ?, state = ?, country = ?, postcode = ?, username = ?, password = ?, role = ?
    WHERE userID = ?`);
  stmt.run([firstName, lastName, email, phone, address, city, state, country, postcode, username, password, role, req.params.id], function (err) {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error updating user' });
    }
    res.json({ success: true, changes: this.changes });
  });
  stmt.finalize();
});

// Update an existing business
app.put('/Businesses/:id', (req, res) => {
  const { businessName, contactType, contactDate, notes, createdAt } = req.body;
  const stmt = db.prepare(`UPDATE Businesses SET
    businessName = ?, contactType = ?, contactDate = ?, notes = ?, createdAt = ?
    WHERE businessID = ?`);
  stmt.run([businessName, contactType, contactDate, notes, createdAt, req.params.id], function (err) {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error updating business' });
    }
    res.json({ success: true, changes: this.changes });
  });
  stmt.finalize();
});

// Update an existing log
app.put('/logs/:id', (req, res) => {
  const { businessID, userID, logDate, logType, notes, createdAt } = req.body;
  
  const stmt = db.prepare(`UPDATE Logs SET
    businessID = ?, userID = ?, logDate = ?, logType = ?, notes = ?, createdAt = ?
    WHERE logID = ?`);

  stmt.run([businessID, userID, logDate, logType, notes, createdAt, req.params.id], function (err) {
    if (err) {
      console.error('Error updating log:', err.message);
      return res.status(500).json({ success: false, message: 'Error updating log' });
    }
    res.json({ success: true, changes: this.changes });
  });

  stmt.finalize();
});


// Delete a user
app.delete('/Users/:id', (req, res) => {
  const stmt = db.prepare('DELETE FROM Users WHERE userID = ?');
  stmt.run([req.params.id], function (err) {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error deleting entity' });
    }
    res.json({ success: true, changes: this.changes });
  });
  stmt.finalize();
});

// Delete a business
app.delete('/Businesses/:id', (req, res) => {
  const stmt = db.prepare('DELETE FROM Businesses WHERE businessID = ?');
  stmt.run([req.params.id], function (err) {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error deleting business' });
    }
    res.json({ success: true, changes: this.changes });
  });
  stmt.finalize();
});

// Delete a log
app.delete('/Logs/:id', (req, res) => {
  const stmt = db.prepare('DELETE FROM Logs WHERE logID = ?');
  stmt.run([req.params.id], function (err) {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error deleting log' });
    }
    res.json({ success: true, changes: this.changes });
  });
  stmt.finalize();
});



// Delete all users and reset userID counter
app.delete('/Users', (req, res) => {
  db.serialize(() => {
    db.run('DELETE FROM Users', function (err) {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error deleting users' });
      }
      db.run('DELETE FROM sqlite_sequence WHERE name="Users"', function (err) {
        if (err) {
          return res.status(500).json({ success: false, message: 'Error resetting userID counter' });
        }
        res.json({ success: true, message: 'All users deleted and userID counter reset.' });
      });
    });
  });
});

// Delete all businesses and reset businessID counter
app.delete('/Businesses', (req, res) => {
  db.serialize(() => {
    db.run('DELETE FROM Businesses', function (err) {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error deleting businesses' });
      }
      db.run('DELETE FROM sqlite_sequence WHERE name="Businesses"', function (err) {
        if (err) {
          return res.status(500).json({ success: false, message: 'Error resetting businessID counter' });
        }
        res.json({ success: true, message: 'All businesses deleted and businessID counter reset.' });
      });
    });
  });
});



// Delete all logs and reset logID counter
app.delete('/logs', (req, res) => {
  db.serialize(() => {
    db.run('DELETE FROM Logs', function (err) {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error deleting logs' });
      }
      db.run('DELETE FROM sqlite_sequence WHERE name="Logs"', function (err) {
        if (err) {
          return res.status(500).json({ success: false, message: 'Error resetting logID counter' });
        }
        res.json({ success: true, message: 'All logs deleted and logID counter reset.' });
      });
    });
  });
});

// Start the Server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

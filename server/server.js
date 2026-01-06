import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'admin123',
  database: 'admin_db'
});

db.connect((err) => {
  if (err) {
    console.error('❌ MySQL Connection Error:', err.message);
    return;
  }
  console.log('✅ Connected to the admin_db database.');
});

// --- PENDING RESIDENTS ROUTES ---

// POST pending resident
app.post('/api/pending-residents', (req, res) => {
  console.log('📥 Pending resident received:', req.body);

  const data = req.body;

  const insertData = {
    Resident_Name: data.Resident_Name || '',
    Resident_ID: data.Resident_ID || '',
    Height: data.Height || null,
    Weight: data.Weight || null,
    BMI: data.BMI || null,
    Health_Condition: data.Health_Condition || '',
    Allergies: data.Allergies || '',
    Submitted_At: data.Submitted_At || new Date(),
    Status: data.Status || 'Pending'
  };

  const sql = 'INSERT INTO pending_residents SET ?';

  db.query(sql, insertData, (err) => {
    if (err) {
      console.error('❌ Insert pending error:', err);
      return res.status(500).json(err);
    }
    res.json({ message: 'Pending resident saved' });
  });
});

// GET pending residents
app.get('/api/pending-residents', (req, res) => {
  db.query(
    'SELECT * FROM pending_residents ORDER BY id DESC', // ✅ fixed column name
    (err, results) => {
      if (err) {
        console.error('❌ Fetch pending error:', err);
        return res.status(500).json(err);
      }
      res.json(results);
    }
  );
});

// DELETE pending resident
app.delete('/api/pending-residents/:id', (req, res) => {
  db.query(
    'DELETE FROM pending_residents WHERE id = ?', // ✅ fixed column name
    [req.params.id],
    (err) => {
      if (err) {
        console.error('❌ Delete pending error:', err);
        return res.status(500).json(err);
      }
      res.json({ message: 'Pending resident removed' });
    }
  );
});

// ACCEPT pending resident
app.post('/api/pending-residents/accept/:id', (req, res) => {
  const pendingId = req.params.id;

  db.query(
    'SELECT * FROM pending_residents WHERE id = ?', // ✅ fixed column name
    [pendingId],
    (err, result) => {
      if (err) {
        console.error('❌ Fetch pending for accept error:', err);
        return res.status(500).json({ error: 'Failed to fetch pending resident' });
      }
      if (result.length === 0) {
        return res.status(404).json({ message: 'Pending resident not found' });
      }

      const p = result[0];

      const insertSql = `
        INSERT INTO health_records 
        (Resident_Name, Resident_ID, Height, Weight, BMI, Health_Condition, Allergies, Date_Registered, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), 'Active')
      `;

      db.query(
        insertSql,
        [
          p.Resident_Name,
          p.Resident_ID,
          p.Height || null,
          p.Weight || null,
          p.BMI || null,
          p.Health_Condition,
          p.Allergies
        ],
        (err2) => {
          if (err2) {
            console.error('❌ Insert into health_records error:', err2);
            return res.status(500).json({ error: 'Failed to move to health records' });
          }

          db.query(
            'DELETE FROM pending_residents WHERE id = ?', // ✅ fixed column name
            [pendingId],
            (err3) => {
              if (err3) {
                console.error('❌ Delete from pending error:', err3);
                return res.status(500).json({ error: 'Moved to health records but failed to remove from pending' });
              }
              res.json({ success: true, message: 'Resident accepted and moved to health records' });
            }
          );
        }
      );
    }
  );
});

// --- OFFICIAL HEALTH RECORDS ROUTES ---
app.get('/api/health-records', (req, res) => {
  db.query(
    "SELECT * FROM health_records ORDER BY Date_Registered DESC",
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

// INSERT official health record
app.post('/api/health-records', (req, res) => {
  const d = req.body;
  const sql = `INSERT INTO health_records 
    (Resident_Name, Resident_ID, Age, Sex, Civil_Status, Blood_Pressure, Weight, Height, BMI, Health_Condition, Diagnosis, Allergies, Contact_Number, Address, Date_Visited, status, Remarks, Date_Registered) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
  const params = [
    d.Resident_Name, d.Resident_ID, d.Age || null, d.Sex, d.Civil_Status, d.Blood_Pressure, 
    d.Weight || null, d.Height || null, d.BMI || null, d.Health_Condition, d.Diagnosis, 
    d.Allergies, d.Contact_Number, d.Address, d.Date_Visited || null, d.status || 'Active', 
    d.Remarks, d.Date_Registered
  ];

  db.query(sql, params, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, id: result.insertId });
  });
});

// UPDATE health record
app.put('/api/health-records/:id', (req, res) => {
  const { id } = req.params;
  const d = req.body;
  const sql = `UPDATE health_records SET 
    Resident_Name=?, Age=?, Sex=?, Civil_Status=?, Blood_Pressure=?, Weight=?, Height=?, 
    BMI=?, Health_Condition=?, Diagnosis=?, Allergies=?, Contact_Number=?, Address=?, 
    Date_Visited=?, Remarks=? WHERE Health_Record_ID=?`;
    
  const params = [
    d.Resident_Name, d.Age || null, d.Sex, d.Civil_Status, d.Blood_Pressure, d.Weight || null, 
    d.Height || null, d.BMI || null, d.Health_Condition, d.Diagnosis, d.Allergies, 
    d.Contact_Number, d.Address, d.Date_Visited || null, d.Remarks, id
  ];

  db.query(sql, params, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// DELETE health record
app.delete('/api/health-records/:id', (req, res) => {
  db.query(
    "DELETE FROM health_records WHERE Health_Record_ID = ?", 
    [req.params.id], 
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

// LOGIN route
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const sql = "SELECT admin_id, username FROM admins WHERE username = ? AND password = SHA2(?, 256)";
  db.query(sql, [username, password], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: "Server error" });
    if (result.length > 0) res.json({ success: true, message: "Login successful!", admin: result[0] });
    else res.status(401).json({ success: false, message: "Invalid username or password" });
  });
});

app.listen(5000, () => console.log(`🚀 Server on http://localhost:5000`));

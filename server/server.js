import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import crypto from 'crypto';

const app = express();
app.use(cors());
app.use(express.json());


const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'admin123',
  database: 'admin_db'
});

db.connect(err => {
  if (err) return console.error(err);
  console.log('✅ Connected to admin_db');
});

/* ================= RESIDENT ================= */
app.post('/api/residents', (req, res) => {
  const sql = `
    INSERT INTO residents 
    (First_Name, Middle_Name, Last_Name, Sex, Civil_Status, Contact_Number, Street, Barangay)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const d = req.body;

  db.query(sql, [
    d.First_Name,
    d.Middle_Name || null,
    d.Last_Name,
    d.Sex,
    d.Civil_Status || null,
    d.Contact_Number || null,
    d.Street || null,
    d.Barangay || null
  ], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ Resident_ID: result.insertId });
  });
});

/* ================= UPDATE RESIDENT ================= */
app.put('/api/residents/:id', (req, res) => {
  const id = req.params.id;
  const d = req.body;
  const sql = `
    UPDATE residents 
    SET First_Name = ?, Middle_Name = ?, Last_Name = ?, Sex = ?, Civil_Status = ?, 
        Birthdate = ?, Contact_Number = ?, Street = ?, Barangay = ?
    WHERE Resident_ID = ?
  `;
  db.query(sql, [
    d.First_Name || null,
    d.Middle_Name || null,
    d.Last_Name || null,
    d.Sex || null,
    d.Civil_Status || null,
    d.Birthdate || null,
    d.Contact_Number || null,
    d.Street || null,
    d.Barangay || null,
    id
  ], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ success: true });
  });
});

/* ================= PENDING ================= */
app.post('/api/pending-resident', (req, res) => {
  const d = req.body;
  const sql = `
    INSERT INTO pending_resident 
    (Resident_ID, Height, Weight, BMI, Health_Condition, Allergies, Submitted_At)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  db.query(sql, [
    d.Resident_ID,
    d.Height || null,
    d.Weight || null,
    d.BMI || null,
    d.Health_Condition || null,
    d.Allergies || null,
    d.Submitted_At || new Date().toISOString().slice(0, 19).replace('T', ' ')
  ], err => {
    if (err) return res.status(500).json(err);
    res.json({ success: true });
  });
});

/* ================= APPROVE ================= */
app.post('/api/pending-resident/approve/:id', (req, res) => {
  const id = req.params.id;

  db.query(
    "SELECT * FROM pending_resident WHERE Pending_HR_ID = ?",
    [id],
    (err, rows) => {
      if (err || rows.length === 0) return res.sendStatus(404);
      const p = rows[0];

      db.query(
        `INSERT INTO health_records 
         (Resident_ID, Weight, Height, BMI, Health_Condition, Allergies)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [p.Resident_ID, p.Weight, p.Height, p.BMI, p.Health_Condition, p.Allergies],
        () => {
          db.query("DELETE FROM pending_resident WHERE Pending_HR_ID = ?", [id]);
          res.json({ success: true });
        }
      );
    }
  );
});

/* ================= RECORDS ================= */
app.get('/api/health-records', (req, res) => {
  const sql = `
    SELECT hr.*, 
      r.First_Name,
      r.Middle_Name,
      r.Last_Name,
      CONCAT(r.First_Name,' ',r.Last_Name) AS Resident_Name,
      r.Sex,
      r.Birthdate,
      r.Civil_Status,
      r.Contact_Number,
      r.Street,
      r.Barangay
    FROM health_records hr
    JOIN residents r ON hr.Resident_ID = r.Resident_ID
    ORDER BY hr.Date_Registered DESC
  `;
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

/* ================= CREATE HEALTH RECORD ================= */
app.post('/api/health-records', (req, res) => {
  const d = req.body;
  const sql = `
    INSERT INTO health_records 
    (Resident_ID, Blood_Pressure, Weight, Height, BMI, Nutrition_Status, Health_Condition, Diagnosis, Allergies, Date_Visited, Remarks_Notes, Recorded_By)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  db.query(sql, [
    d.Resident_ID,
    d.Blood_Pressure || null,
    d.Weight || null,
    d.Height || null,
    d.BMI || null,
    d.Nutrition_Status || null,
    d.Health_Condition || null,
    d.Diagnosis || null,
    d.Allergies || null,
    d.Date_Visited || null,
    d.Remarks_Notes || d.Remarks || null,
    d.Recorded_By || null  // ← ADD THIS
  ], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ Health_Record_ID: result.insertId, success: true });
  });
});

/* ================= UPDATE HEALTH RECORD ================= */
app.put('/api/health-records/:id', (req, res) => {
  const id = req.params.id;
  const d = req.body;
  const sql = `
    UPDATE health_records 
    SET Blood_Pressure = ?, Weight = ?, Height = ?, BMI = ?, Nutrition_Status = ?, Health_Condition = ?, 
        Diagnosis = ?, Allergies = ?, Date_Visited = ?, Remarks_Notes = ?, Recorded_By = ?
    WHERE Health_Record_ID = ?
  `;
  db.query(sql, [
    d.Blood_Pressure || null,
    d.Weight || null,
    d.Height || null,
    d.BMI || null,
    d.Nutrition_Status || null,
    d.Health_Condition || null,
    d.Diagnosis || null,
    d.Allergies || null,
    d.Date_Visited || null,
    d.Remarks_Notes || d.Remarks || null,
    d.Recorded_By || null,  // ← ADD THIS
    id
  ], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ success: true });
  });
});

/* ================= DELETE HEALTH RECORD (and related data) ================= */
app.delete('/api/health-records/:id', (req, res) => {
  const healthRecordId = req.params.id;
  
  // First, get the Resident_ID associated with this health record
  db.query(
    'SELECT Resident_ID FROM health_records WHERE Health_Record_ID = ?',
    [healthRecordId],
    (err, rows) => {
      if (err) return res.status(500).json(err);
      if (rows.length === 0) return res.status(404).json({ error: 'Record not found' });
      
      const residentId = rows[0].Resident_ID;
      
      // Delete the health record
      db.query(
        'DELETE FROM health_records WHERE Health_Record_ID = ?',
        [healthRecordId],
        (err) => {
          if (err) return res.status(500).json(err);
          
          // Also delete any pending records for this resident
          db.query(
            'DELETE FROM pending_resident WHERE Resident_ID = ?',
            [residentId],
            (err) => {
              if (err) return res.status(500).json(err);
              
              // Finally, delete the resident from the residents table
              db.query(
                'DELETE FROM residents WHERE Resident_ID = ?',
                [residentId],
                (err) => {
                  if (err) return res.status(500).json(err);
                  res.json({ success: true, message: 'Record and resident data deleted' });
                }
              );
            }
          );
        }
      );
    }
  );
});

/* ================= GET PENDING RESIDENTS ================= */
app.get('/api/pending-residents', (req, res) => {
  const sql = `
    SELECT pr.*, 
      r.First_Name, r.Middle_Name, r.Last_Name, r.Sex, r.Civil_Status, 
      r.Contact_Number, r.Street, r.Barangay, r.Birthdate,
      CONCAT(r.First_Name,' ',r.Last_Name) AS Resident_Name
    FROM pending_resident pr
    JOIN residents r ON pr.Resident_ID = r.Resident_ID
    ORDER BY pr.Submitted_At DESC
  `;
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

/* ================= APPROVE PENDING RESIDENT ================= */
app.post('/api/pending-residents/accept/:id', (req, res) => {
  const id = req.params.id;

  db.query(
    "SELECT * FROM pending_resident WHERE Pending_HR_ID = ?",
    [id],
    (err, rows) => {
      if (err || rows.length === 0) return res.sendStatus(404);
      const p = rows[0];

      db.query(
        `INSERT INTO health_records 
         (Resident_ID, Height, Weight, BMI, Health_Condition, Allergies)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [p.Resident_ID, p.Height, p.Weight, p.BMI, p.Health_Condition, p.Allergies],
        (err, result) => {
          if (err) return res.status(500).json(err);
          db.query("DELETE FROM pending_resident WHERE Pending_HR_ID = ?", [id], (err) => {
            if (err) return res.status(500).json(err);
            res.json({ success: true, Health_Record_ID: result.insertId });
          });
        }
      );
    }
  );
});

/* ================= DELETE PENDING RESIDENT ================= */
app.delete('/api/pending-residents/:id', (req, res) => {
  const id = req.params.id;
  const sql = `DELETE FROM pending_resident WHERE Pending_HR_ID = ?`;
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ success: true });
  });
});

/* ================= LOGIN ================= */
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password required' });
  }

  const sql = 'SELECT * FROM admins WHERE username = ?';
  
  db.query(sql, [username], (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error' });
    
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    const admin = rows[0];
    
    // Hash the input password with SHA2 and compare with DB
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    
    if (admin.password === hashedPassword) {
      return res.json({ 
        success: true, 
        message: 'Login successful',
        adminId: admin.admin_id,
        username: admin.username
      });
    } else {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
  });
});

app.listen(5000, () => console.log('🚀 Server running'));
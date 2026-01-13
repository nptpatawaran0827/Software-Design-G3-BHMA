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
  password: '@Group3-BHMA',
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
    (Resident_ID, First_Name, Middle_Name, Last_Name, Sex, Civil_Status, Birthdate, Contact_Number, Street, Barangay)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const d = req.body;
  db.query(sql, [
    d.Resident_ID,
    d.First_Name,
    d.Middle_Name || null,
    d.Last_Name,
    d.Sex,
    d.Civil_Status || null,
    d.Birthdate || null,
    d.Contact_Number || null,
    d.Street || null,
    d.Barangay || null
  ], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ Resident_ID: d.Resident_ID, success: true });
  });
});

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

/* ================= PENDING (UPDATED WITH Is_PWD) ================= */
app.post('/api/pending-resident', (req, res) => {
  const d = req.body;
  const sql = `
    INSERT INTO pending_resident 
    (Resident_ID, Is_PWD, Height, Weight, BMI, Health_Condition, Allergies, Submitted_At)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  db.query(sql, [
    d.Resident_ID,
    d.Is_PWD ? 1 : 0, // Convert boolean to TINYINT
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

/* ================= RECORDS (GET) ================= */
app.get('/api/health-records', (req, res) => {
  const sql = `
    SELECT hr.*, 
      r.First_Name, r.Middle_Name, r.Last_Name,
      CONCAT(r.First_Name,' ',r.Last_Name) AS Resident_Name,
      r.Sex, r.Birthdate, r.Civil_Status, r.Contact_Number, r.Street, r.Barangay
    FROM health_records hr
    JOIN residents r ON hr.Resident_ID = r.Resident_ID
    ORDER BY hr.Date_Registered DESC
  `;
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

/* ================= CREATE HEALTH RECORD (UPDATED WITH Is_PWD) ================= */
app.post('/api/health-records', (req, res) => {
  const d = req.body;
  const sql = `
    INSERT INTO health_records 
    (Resident_ID, Is_PWD, Blood_Pressure, Weight, Height, BMI, Nutrition_Status, Health_Condition, Diagnosis, Allergies, Date_Visited, Remarks_Notes, Recorded_By)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  db.query(sql, [
    d.Resident_ID,
    d.Is_PWD ? 1 : 0, // Save PWD Status
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
    d.Recorded_By || null  
  ], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ Health_Record_ID: result.insertId, success: true });
  });
});

/* ================= UPDATE HEALTH RECORD (UPDATED WITH Is_PWD) ================= */
app.put('/api/health-records/:id', (req, res) => {
  const id = req.params.id;
  const d = req.body;
  const sql = `
    UPDATE health_records 
    SET Is_PWD = ?, Blood_Pressure = ?, Weight = ?, Height = ?, BMI = ?, Nutrition_Status = ?, 
        Health_Condition = ?, Diagnosis = ?, Allergies = ?, Date_Visited = ?, Remarks_Notes = ?, Recorded_By = ?
    WHERE Health_Record_ID = ?
  `;
  db.query(sql, [
    d.Is_PWD ? 1 : 0, // Update PWD Status
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
    d.Recorded_By || null,  
    id
  ], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ success: true });
  });
});

/* ================= APPROVE PENDING (UPDATED TO TRANSFER Is_PWD) ================= */
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
          (Resident_ID, Is_PWD, Height, Weight, BMI, Health_Condition, Allergies)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [p.Resident_ID, p.Is_PWD || 0, p.Height, p.Weight, p.BMI, p.Health_Condition, p.Allergies],
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

/* ================= DELETE ROUTES ================= */
app.delete('/api/health-records/:id', (req, res) => {
  const healthRecordId = req.params.id;
  db.query('SELECT Resident_ID FROM health_records WHERE Health_Record_ID = ?', [healthRecordId], (err, rows) => {
    if (err || rows.length === 0) return res.status(404).json({ error: 'Not found' });
    const residentId = rows[0].Resident_ID;
    db.query('DELETE FROM health_records WHERE Health_Record_ID = ?', [healthRecordId], () => {
      db.query('DELETE FROM pending_resident WHERE Resident_ID = ?', [residentId], () => {
        db.query('DELETE FROM residents WHERE Resident_ID = ?', [residentId], () => {
          res.json({ success: true });
        });
      });
    });
  });
});

app.delete('/api/pending-residents/remove/:id', (req, res) => {
  const pendingId = req.params.id;
  db.query('SELECT Resident_ID FROM pending_resident WHERE Pending_HR_ID = ?', [pendingId], (err, rows) => {
    if (err || rows.length === 0) return res.sendStatus(404);
    const residentId = rows[0].Resident_ID;
    db.query('DELETE FROM pending_resident WHERE Pending_HR_ID = ?', [pendingId], () => {
      db.query('DELETE FROM health_records WHERE Resident_ID = ?', [residentId], () => {
        db.query('DELETE FROM residents WHERE Resident_ID = ?', [residentId], () => {
          res.json({ success: true });
        });
      });
    });
  });
});

app.get('/api/pending-residents', (req, res) => {
  const sql = `
    SELECT pr.*, r.First_Name, r.Middle_Name, r.Last_Name, r.Sex, r.Birthdate,
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

/* ================= AUTH ================= */
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const sql = 'SELECT * FROM admins WHERE username = ?';
  db.query(sql, [username], (err, rows) => {
    if (err || rows.length === 0) return res.status(401).json({ success: false });
    const admin = rows[0];
    const hashed = crypto.createHash('sha256').update(password).digest('hex');
    if (admin.password === hashed) {
      res.json({ success: true, adminId: admin.admin_id, username: admin.username });
    } else {
      res.status(401).json({ success: false });
    }
  });
});

app.listen(5000, () => console.log('🚀 Server running on port 5000'));
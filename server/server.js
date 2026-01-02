import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';

const app = express();



// --- MIDDLEWARE ---
app.use(cors()); // Allows React (port 3000/5173) to talk to Node (port 5000)
app.use(express.json()); // Allows the server to read JSON data from req.body

// --- DATABASE CONNECTION ---
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'CodeMultiverse27',
  database: 'admin_db'
});



db.connect((err) => {
  if (err) {
    console.error('❌ MySQL Connection Error:', err.message);
    return;
  }
  console.log('✅ Connected to the admin_db database.');
});

// --- ROUTES ---

/**
 * LOGIN ROUTE
 * Matches the fetch('http://localhost:5000/api/login') in your React code
 */

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  // We use SHA2(?, 256) because your SQL database stores hashed passwords
  const sql = "SELECT admin_id, username FROM admins WHERE username = ? AND password = SHA2(?, 256)";

  db.query(sql, [username, password], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ success: false, message: "Server error" });
    }

    if (result.length > 0) {
      // Login Success
      res.json({
        success: true,
        message: "Login successful!",
        admin: result[0]
      });

    } else {
      // Login Failure
      res.status(401).json({
        success: false,
        message: "Invalid username or password"
      });
    }
  });
});

/**

 * DATA FETCH ROUTE (Optional)

 * Useful for testing if the connection is alive

 */

app.get('/api/admins', (req, res) => {
  db.query("SELECT admin_id, username FROM admins", (err, result) => {
    if (err) res.status(500).send(err);
    else res.json(result);
  });
});


// 1. GET ALL RECORDS
app.get('/api/health-records', (req, res) => {
  const sql = "SELECT * FROM health_records ORDER BY Date_Registered DESC";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// 2. CREATE NEW RECORD
app.post('/api/health-records', (req, res) => {
  const d = req.body;
  const sql = `INSERT INTO health_records 
    (Resident_Name, Resident_ID, Age, Sex, Civil_Status, Blood_Pressure, Weight, Height, BMI, Health_Condition, Diagnosis, Allergies, Contact_Number, Address, Date_Visited, status, Remarks) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const params = [
    d.Resident_Name, d.Resident_ID, d.Age || null, d.Sex, d.Civil_Status, d.Blood_Pressure, 
    d.Weight || null, d.Height || null, d.BMI || null, d.Health_Condition, d.Diagnosis, 
    d.Allergies, d.Contact_Number, d.Address, d.Date_Visited || null, d.status || 'Active', d.Remarks
  ];

  db.query(sql, params, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, id: result.insertId });
  });
});

// 3. UPDATE FULL RECORD
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

// 4. UPDATE STATUS ONLY
app.put('/api/health-records/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  db.query("UPDATE health_records SET status = ? WHERE Health_Record_ID = ?", [status, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// 5. DELETE RECORD
app.delete('/api/health-records/:id', (req, res) => {
  db.query("DELETE FROM health_records WHERE Health_Record_ID = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.listen(5000, () => console.log(`🚀 Server on http://localhost:5000`));
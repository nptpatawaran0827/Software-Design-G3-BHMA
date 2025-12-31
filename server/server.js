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
  password: '@Jianvench18',
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

// --- START SERVER ---
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
import express from "express";
import mysql from "mysql2";
import cors from "cors";
import crypto from "crypto";

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'health-monitoring-analytics-system.colao00gscmx.us-east-1.rds.amazonaws.com',
  user: 'admin', 
  password: 'Group3-BHMA', 
  database: 'admin_db'
});

db.connect(err => {
  if (err) return console.error(err);
  console.log('Connected to admin_db');
});

/* ================= ACTIVITY LOGS HELPER ================= */
// Updated to use admin_id as the primary identifier
const logActivity = (residentId, action, adminId) => {
  const sql = "INSERT INTO activity_logs (record_name, action_type, Resident_ID, admin_id) VALUES (?, ?, ?, ?)";
  // Using residentId for record_name to ensure ID-based tracking
  db.query(sql, [residentId, action, residentId, adminId || 1], (err) => {
    if (err) console.error("❌ Activity Log Error:", err);
  });
};

/* ================= HEATMAP DATA ================= */
app.get("/api/heatmap-data", (req, res) => {
  const type = req.query.type || "condition"; 

  if (type === "diagnosis") {
    const sql = `
      SELECT
        s.Street_ID, s.Street_Name, s.Latitude, s.Longitude,
        r.Barangay, hr.Diagnosis, COUNT(*) as count
      FROM health_records hr
      JOIN residents r ON hr.Resident_ID = r.Resident_ID
      JOIN streets s ON r.Street_ID = s.Street_ID
      WHERE hr.Diagnosis IS NOT NULL AND hr.Diagnosis != ''
      GROUP BY s.Street_ID, r.Barangay, hr.Diagnosis
      ORDER BY s.Street_Name ASC, count DESC
    `;

    db.query(sql, (err, results) => {
      if (err) {
        console.error("❌ Diagnosis heatmap query error:", err);
        return res.status(500).json({ error: err.message });
      }
      const topDiagnosisPerStreet = {};
      const filteredResults = [];
      results.forEach((row) => {
        if (!topDiagnosisPerStreet[row.Street_ID]) {
          topDiagnosisPerStreet[row.Street_ID] = true;
          filteredResults.push(row);
        }
      });
      res.json(filteredResults);
    });
  } else {
    const sql = `
      SELECT
        s.Street_ID, s.Street_Name, s.Latitude, s.Longitude,
        r.Barangay, hr.Health_Condition, COUNT(*) as count
      FROM health_records hr
      JOIN residents r ON hr.Resident_ID = r.Resident_ID
      JOIN streets s ON r.Street_ID = s.Street_ID
      WHERE hr.Health_Condition IS NOT NULL AND hr.Health_Condition != ''
      GROUP BY s.Street_ID, r.Barangay, hr.Health_Condition
      ORDER BY s.Street_Name ASC, count DESC
    `;

    db.query(sql, (err, results) => {
      if (err) {
        console.error("❌ Condition heatmap query error:", err);
        return res.status(500).json({ error: err.message });
      }
      const topConditionPerStreet = {};
      const filteredResults = [];
      results.forEach((row) => {
        if (!topConditionPerStreet[row.Street_ID]) {
          topConditionPerStreet[row.Street_ID] = true;
          filteredResults.push(row);
        }
      });
      res.json(filteredResults);
    });
  }
});

/* ================= GET STREETS ================= */
app.get("/api/streets", (req, res) => {
  db.query("SELECT * FROM streets ORDER BY Street_Name ASC", (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

/* ================= GET ACTIVITY LOGS ================= */
app.get("/api/activity-logs", (req, res) => {
  const sql = "SELECT log_id, action_type, Resident_ID AS Resident_ID, created_at FROM activity_logs ORDER BY created_at DESC";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching logs:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

/* ================= RESIDENT ================= */
app.post("/api/residents", (req, res) => {
  const d = req.body;
  const checkSql = `
    SELECT Resident_ID FROM residents
    WHERE TRIM(First_Name) = TRIM(?)
    AND COALESCE(TRIM(Middle_Name), '') = COALESCE(TRIM(?), '')
    AND TRIM(Last_Name) = TRIM(?)
  `;

  db.query(checkSql, [d.First_Name, d.Middle_Name || "", d.Last_Name], (err, rows) => {
    if (err) {
      console.error("❌ DB Error during check:", err);
      return res.status(500).json(err);
    }

    if (rows.length > 0) {
      return res.json({
        success: true,
        isDuplicate: true,
        Resident_ID: rows[0].Resident_ID,
      });
    }

    const sql = `
      INSERT INTO residents
      (Resident_ID, First_Name, Middle_Name, Last_Name, Sex, Civil_Status, Birthdate, Contact_Number, Street_ID, Barangay)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [
      d.Resident_ID, d.First_Name, d.Middle_Name || null, d.Last_Name, d.Sex, 
      d.Civil_Status || null, d.Birthdate || null, d.Contact_Number || null, 
      d.Street_ID || null, d.Barangay || null
    ], (err, result) => {
      if (err) {
        console.error("❌ DB Error during insert:", err);
        return res.status(500).json(err);
      }
      res.json({ Resident_ID: d.Resident_ID, success: true, isDuplicate: false });
    });
  });
});

app.put("/api/residents/:id", (req, res) => {
  const id = req.params.id;
  const d = req.body;
  const sql = `
    UPDATE residents
    SET First_Name = ?, Middle_Name = ?, Last_Name = ?, Sex = ?, Civil_Status = ?,
        Birthdate = ?, Contact_Number = ?, Street_ID = ?, Barangay = ?
    WHERE Resident_ID = ?
  `;
  db.query(sql, [
    d.First_Name || null, d.Middle_Name || null, d.Last_Name || null, d.Sex || null, 
    d.Civil_Status || null, d.Birthdate || null, d.Contact_Number || null, 
    d.Street_ID || null, d.Barangay || null, id
  ], (err) => {
    if (err) {
      console.error("❌ Update error:", err);
      return res.status(500).json(err);
    }
    res.json({ success: true });
  });
});

/* ================= PENDING RESIDENT ================= */
app.post("/api/pending-resident", (req, res) => {
  const d = req.body;
  const sql = `
    INSERT INTO pending_resident
    (Resident_ID, Is_PWD, Height, Weight, BMI, Health_Condition, Allergies, Submitted_At)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  db.query(sql, [
    d.Resident_ID, d.Is_PWD ? 1 : 0, d.Height || null, d.Weight || null, d.BMI || null, 
    d.Health_Condition || null, d.Allergies || null, 
    d.Submitted_At || new Date().toISOString().slice(0, 19).replace("T", " "),
  ], (err) => {
    if (err) {
      console.error("❌ Pending resident error:", err);
      return res.status(500).json(err);
    }
    res.json({ success: true });
  });
});

/* ================= GET HEALTH RECORDS ================= */
app.get("/api/health-records", (req, res) => {
  const sql = `
    SELECT hr.*, r.First_Name, r.Middle_Name, r.Last_Name,
      CONCAT(r.First_Name,' ',r.Last_Name) AS Resident_Name,
      r.Sex, r.Birthdate, r.Civil_Status, r.Contact_Number, r.Barangay,
      s.Street_Name, a.username AS Recorded_By_Name
    FROM health_records hr
    JOIN residents r ON hr.Resident_ID = r.Resident_ID
    LEFT JOIN streets s ON r.Street_ID = s.Street_ID
    LEFT JOIN admins a ON hr.Recorded_By = a.admin_id
    ORDER BY hr.Date_Registered DESC
  `;
  db.query(sql, (err, rows) => {
    if (err) {
      console.error("❌ Health records error:", err);
      return res.status(500).json(err);
    }
    res.json(rows);
  });
});

/* ================= ADD HEALTH RECORD ================= */
app.post("/api/health-records", (req, res) => {
  const d = req.body;
  const checkSql = `SELECT Resident_ID FROM residents WHERE TRIM(First_Name) = TRIM(?) AND COALESCE(TRIM(Middle_Name), '') = COALESCE(TRIM(?), '') AND TRIM(Last_Name) = TRIM(?)`;

  db.query(checkSql, [d.First_Name, d.Middle_Name || "", d.Last_Name], (err, rows) => {
    if (err) return res.status(500).json({ error: "DB Check Error", details: err.message });
    if (rows && rows.length > 0) return res.status(200).json({ success: false, isDuplicate: true, message: "Duplicate entries are not allowed." });

    db.beginTransaction((tErr) => {
      if (tErr) return res.status(500).json(tErr);

      const resSql = `INSERT INTO residents (Resident_ID, First_Name, Middle_Name, Last_Name, Sex, Civil_Status, Birthdate, Contact_Number, Street_ID, Barangay) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      db.query(resSql, [d.Resident_ID, d.First_Name, d.Middle_Name || null, d.Last_Name, d.Sex || null, d.Civil_Status || null, d.Birthdate || null, d.Contact_Number || null, d.Street_ID || null, d.Barangay || "Marikina Heights"], (resErr) => {
        if (resErr) return db.rollback(() => res.status(500).json({ error: "Resident Insert Failed" }));

        const hrSql = `INSERT INTO health_records (Resident_ID, Is_PWD, Blood_Pressure, Weight, Height, BMI, Nutrition_Status, Health_Condition, Diagnosis, Allergies, Date_Visited, Remarks_Notes, Recorded_By) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        let adminIdForRecord = parseInt(d.Recorded_By || d.adminId) || null;

        db.query(hrSql, [d.Resident_ID, d.Is_PWD ? 1 : 0, d.Blood_Pressure || null, d.Weight || null, d.Height || null, d.BMI || null, d.Nutrition_Status || null, d.Health_Condition || null, d.Diagnosis || null, d.Allergies || null, d.Date_Visited || null, d.Remarks || d.Remarks_Notes || null, adminIdForRecord], (hrErr) => {
          if (hrErr) return db.rollback(() => res.status(500).json({ error: "Health Record Failed" }));

          db.commit((commitErr) => {
            if (commitErr) return db.rollback(() => res.status(500).json(commitErr));
            logActivity(d.Resident_ID, "added", adminIdForRecord);
            res.json({ success: true, isDuplicate: false });
          });
        });
      });
    });
  });
});

/* ================= APPROVE PENDING ================= */
app.post("/api/pending-resident/accept/:id", (req, res) => {
  const id = req.params.id;
  const { adminId } = req.body;

  db.query("SELECT * FROM pending_resident WHERE Pending_HR_ID = ?", [id], (err, rows) => {
    if (err || rows.length === 0) return res.sendStatus(404);
    const p = rows[0];

    db.beginTransaction((tErr) => {
      if (tErr) return res.status(500).json(tErr);
      db.query(`INSERT INTO health_records (Resident_ID, Is_PWD, Height, Weight, BMI, Health_Condition, Allergies, Recorded_By) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
        [p.Resident_ID, p.Is_PWD || 0, p.Height, p.Weight, p.BMI, p.Health_Condition, p.Allergies, adminId], (err, result) => {
        if (err) return db.rollback(() => res.status(500).json(err));
        db.query("DELETE FROM pending_resident WHERE Pending_HR_ID = ?", [id], (err) => {
          if (err) return db.rollback(() => res.status(500).json(err));
          db.commit((commitErr) => {
            if (commitErr) return db.rollback(() => res.status(500).json(commitErr));
            logActivity(p.Resident_ID, "added", adminId);
            res.json({ success: true, Health_Record_ID: result.insertId });
          });
        });
      });
    });
  });
});

/* ================= UPDATE HEALTH RECORD ================= */
app.put("/api/health-records/:id", (req, res) => {
  const healthRecordId = req.params.id;
  const d = req.body;

  db.beginTransaction((err) => {
    if (err) return res.status(500).json(err);
    const resSql = `UPDATE residents r JOIN health_records hr ON r.Resident_ID = hr.Resident_ID SET r.First_Name = ?, r.Middle_Name = ?, r.Last_Name = ?, r.Sex = ?, r.Civil_Status = ?, r.Birthdate = ?, r.Contact_Number = ?, r.Street_ID = ?, r.Barangay = ? WHERE hr.Health_Record_ID = ?`;
    db.query(resSql, [d.First_Name, d.Middle_Name || null, d.Last_Name, d.Sex, d.Civil_Status, d.Birthdate, d.Contact_Number, d.Street_ID || null, d.Barangay, healthRecordId], (resErr) => {
      if (resErr) return db.rollback(() => res.status(500).json(resErr));

      const hrSql = `UPDATE health_records SET Is_PWD = ?, Blood_Pressure = ?, Weight = ?, Height = ?, BMI = ?, Nutrition_Status = ?, Health_Condition = ?, Diagnosis = ?, Allergies = ?, Date_Visited = ?, Remarks_Notes = ? WHERE Health_Record_ID = ?`;
      db.query(hrSql, [d.Is_PWD ? 1 : 0, d.Blood_Pressure, d.Weight || null, d.Height || null, d.BMI || null, d.Nutrition_Status, d.Health_Condition, d.Diagnosis, d.Allergies, d.Date_Visited, d.Remarks || d.Remarks_Notes || null, healthRecordId], (hrErr) => {
        if (hrErr) return db.rollback(() => res.status(500).json(hrErr));

        db.commit((commitErr) => {
          if (commitErr) return db.rollback(() => res.status(500).json(commitErr));
          logActivity(d.Resident_ID, "modified", d.adminId);
          res.json({ success: true });
        });
      });
    });
  });
});

/* ================= DELETE HEALTH RECORD ================= */
app.delete("/api/health-records/:id", (req, res) => {
  const healthRecordId = req.params.id;
  const adminId = req.query.adminId;

  db.query("SELECT Resident_ID FROM health_records WHERE Health_Record_ID = ?", [healthRecordId], (err, rows) => {
    if (err || rows.length === 0) return res.status(404).json({ error: "Not found" });
    const residentId = rows[0].Resident_ID;

    db.beginTransaction((err) => {
      if (err) return res.status(500).json(err);
      db.query("DELETE FROM health_records WHERE Health_Record_ID = ?", [healthRecordId], (err) => {
        if (err) return db.rollback(() => res.status(500).json(err));
        db.query("DELETE FROM pending_resident WHERE Resident_ID = ?", [residentId], (err) => {
          if (err) return db.rollback(() => res.status(500).json(err));
          db.query("DELETE FROM residents WHERE Resident_ID = ?", [residentId], (err) => {
            if (err) return db.rollback(() => res.status(500).json(err));
            db.commit((err) => {
              if (err) return db.rollback(() => res.status(500).json(err));
              logActivity(residentId, "removed", adminId);
              res.json({ success: true });
            });
          });
        });
      });
    });
  });
});

/* ================= DELETE PENDING RESIDENT ================= */
app.delete("/api/pending-resident/remove/:id", (req, res) => {
  const pendingId = req.params.id;
  const adminId = req.query.adminId;

  db.query("SELECT Resident_ID FROM pending_resident WHERE Pending_HR_ID = ?", [pendingId], (err, rows) => {
    if (err || rows.length === 0) return res.sendStatus(404);
    const residentId = rows[0].Resident_ID;

    db.beginTransaction((err) => {
      if (err) return res.status(500).json(err);
      db.query("DELETE FROM pending_resident WHERE Pending_HR_ID = ?", [pendingId], (err) => {
        if (err) return db.rollback(() => res.status(500).json(err));
        db.query("DELETE FROM residents WHERE Resident_ID = ?", [residentId], (err) => {
          if (err) return db.rollback(() => res.status(500).json(err));
          db.commit((err) => {
            if (err) return db.rollback(() => res.status(500).json(err));
            logActivity(residentId, "removed", adminId);
            res.json({ success: true });
          });
        });
      });
    });
  });
});

/* ================= GET PENDING RESIDENTS ================= */
app.get("/api/pending-resident", (req, res) => {
  const sql = `SELECT pr.*, r.First_Name, r.Middle_Name, r.Last_Name, r.Sex, r.Birthdate, CONCAT(r.First_Name,' ',r.Last_Name) AS Resident_Name FROM pending_resident pr JOIN residents r ON pr.Resident_ID = r.Resident_ID ORDER BY pr.Submitted_At DESC`;
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

/* ================= AUTH LOGIN ================= */
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  db.query("SELECT * FROM admins WHERE username = ?", [username], (err, rows) => {
    if (err || rows.length === 0) return res.status(401).json({ success: false });
    const admin = rows[0];
    const hashed = crypto.createHash("sha256").update(password).digest("hex");
    if (admin.password === hashed) {
      res.json({ success: true, adminId: admin.admin_id, username: admin.username });
    } else {
      res.status(401).json({ success: false });
    }
  });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
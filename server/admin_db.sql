CREATE DATABASE admin_db;
USE admin_db;

CREATE TABLE admins (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

INSERT INTO admins (username, password)
VALUES ('Admin_H1', SHA2('Healthworker01', 256));

INSERT INTO admins (username, password)
VALUES ('Admin_H2', SHA2('Healthworker002', 256));

SELECT * FROM admins;

CREATE TABLE residents (
  Resident_ID VARCHAR(20) PRIMARY KEY, 
  First_Name VARCHAR(100) NOT NULL,
  Middle_Name VARCHAR(100),
  Last_Name VARCHAR(100) NOT NULL,
  Sex ENUM('Male','Female') NOT NULL,
  Birthdate DATE,
  Civil_Status VARCHAR(50),
  Contact_Number VARCHAR(20),
  Street VARCHAR(255),
  Barangay VARCHAR(255)
);


CREATE TABLE health_records (
  Health_Record_ID INT AUTO_INCREMENT PRIMARY KEY,
  Resident_ID VARCHAR(20) NOT NULL, 
  Blood_Pressure VARCHAR(20),
  Weight DECIMAL(5,2),
  Height DECIMAL(5,2),
  BMI DECIMAL(5,2),
  Nutrition_Status VARCHAR(50),
  Health_Condition ENUM('Good','Fair','Poor'),
  Allergies TEXT,
  Diagnosis TEXT,
  Remarks_Notes TEXT,
  Date_Visited DATE,
  Date_Registered DATETIME DEFAULT CURRENT_TIMESTAMP,
  Recorded_By INT NULL,
  FOREIGN KEY (Resident_ID) REFERENCES residents(Resident_ID) ON DELETE CASCADE
);


CREATE TABLE pending_resident (
  Pending_HR_ID INT AUTO_INCREMENT PRIMARY KEY,
  Resident_ID VARCHAR(20) NOT NULL,
  Height DECIMAL(5,2),
  Weight DECIMAL(5,2),
  BMI DECIMAL(5,2),
  Health_Condition ENUM('Good','Fair','Poor'),
  Allergies TEXT,
  Submitted_At DATETIME DEFAULT CURRENT_TIMESTAMP,
  Status ENUM('Pending','Approved','Rejected') DEFAULT 'Pending',
  Verified_By INT NULL,
  FOREIGN KEY (Resident_ID) REFERENCES residents(Resident_ID) ON DELETE CASCADE
);

DROP DATABASE admin_db;
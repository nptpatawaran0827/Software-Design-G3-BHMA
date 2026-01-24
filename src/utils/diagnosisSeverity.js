/**
 * DIAGNOSIS SEVERITY MAPPING
 * Maps specific diagnoses to severity levels and colors for heatmap visualization
 * Used by: HeatmapPage.jsx and StreetHeatmap.jsx
 */


export const diagnosisSeverityMap = {
  // ===== CRITICAL/HIGH SEVERITY (Red) =====
  'Hypertension': { severity: 'High', color: '#FF0000', icon: '🔴' },
  'Diabetes': { severity: 'High', color: '#FF0000', icon: '🔴' },
  'Heart Disease': { severity: 'High', color: '#FF0000', icon: '🔴' },
  'Stroke': { severity: 'High', color: '#FF0000', icon: '🔴' },
  'Cancer': { severity: 'High', color: '#FF0000', icon: '🔴' },
  'Chronic Kidney Disease': { severity: 'High', color: '#FF0000', icon: '🔴' },
  'Severe Hypertension': { severity: 'High', color: '#FF0000', icon: '🔴' },
  'Tuberculosis': { severity: 'High', color: '#FF0000', icon: '🔴' },


  // ===== MODERATE/MEDIUM SEVERITY (Orange) =====
  'Respiratory Infection': { severity: 'Medium', color: '#FF7F00', icon: '🟠' },
  'Asthma': { severity: 'Medium', color: '#FF7F00', icon: '🟠' },
  'Pneumonia': { severity: 'Medium', color: '#FF7F00', icon: '🟠' },
  'Arthritis': { severity: 'Medium', color: '#FF7F00', icon: '🟠' },
  'Thyroid Disease': { severity: 'Medium', color: '#FF7F00', icon: '🟠' },
  'High Cholesterol': { severity: 'Medium', color: '#FF7F00', icon: '🟠' },
  'Gastritis': { severity: 'Medium', color: '#FF7F00', icon: '🟠' },
  'Bronchitis': { severity: 'Medium', color: '#FF7F00', icon: '🟠' },


  // ===== MILD/LOW SEVERITY (Yellow) =====
  'Flu': { severity: 'Low', color: '#FFFF00', icon: '🟡' },
  'Sore Throat': { severity: 'Low', color: '#FFFF00', icon: '🟡' },
  'Cough': { severity: 'Low', color: '#FFFF00', icon: '🟡' },
  'Cold': { severity: 'Low', color: '#FFFF00', icon: '🟡' },
  'Stomach Ache': { severity: 'Low', color: '#FFFF00', icon: '🟡' },
  'Headache': { severity: 'Low', color: '#FFFF00', icon: '🟡' },
  'Skin Rash': { severity: 'Low', color: '#FFFF00', icon: '🟡' },
  'Acne': { severity: 'Low', color: '#FFFF00', icon: '🟡' },
  'Allergies': { severity: 'Low', color: '#FFFF00', icon: '🟡' },
  'Amnesia': { severity: 'Low', color: '#FFFF00', icon: '🟡' },
  'baliw': { severity: 'Low', color: '#FFFF00', icon: '🟡' },


  // ===== HEALTHY/GOOD (Green/Blue) =====
  'Good Health': { severity: 'Healthy', color: '#00FF00', icon: '🟢' },
  'No Diagnosis': { severity: 'Healthy', color: '#0000FF', icon: '🔵' },
};


/**
 * Get diagnosis severity info with fallback for unknown diagnoses
 * @param {string} diagnosis - The diagnosis name
 * @returns {object} - { severity, color, icon }
 */
export const getDiagnosisSeverity = (diagnosis) => {
  if (!diagnosis || diagnosis.trim() === '') {
    return { severity: 'Unknown', color: '#808080', icon: '⚪' };
  }
 
  return diagnosisSeverityMap[diagnosis] || {
    severity: 'Unclassified',
    color: '#A9A9A9',
    icon: '⚪'
  };
};


/**
 * Get all unique severities for filtering
 * @returns {array} - Sorted array of severity levels
 */
export const getSeverityFilters = () => {
  const severities = new Set();
  Object.values(diagnosisSeverityMap).forEach(item => {
    severities.add(item.severity);
  });
  return Array.from(severities).sort();
};


/**
 * Get all unique diagnoses
 * @returns {array} - Array of diagnosis names
 */
export const getAllDiagnoses = () => {
  return Object.keys(diagnosisSeverityMap).sort();
};


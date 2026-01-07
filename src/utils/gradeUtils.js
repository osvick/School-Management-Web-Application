// src/utils/gradeUtils.js

/**
 * Convert total score (0–100) to letter grade
 */
export function calculateGrade(total) {
  if (total >= 70) return "A";
  if (total >= 60) return "B";
  if (total >= 50) return "C";
  if (total >= 45) return "D";
  if (total >= 40) return "E";
  return "F";
}

/**
 * Convert total score (0–100) to GPA (5-point scale)
 */
export function calculateGPA(total) {
  if (total >= 70) return 5.0;
  if (total >= 60) return 4.0;
  if (total >= 50) return 3.0;
  if (total >= 45) return 2.0;
  if (total >= 40) return 1.0;
  return 0.0;
}

export type PasswordValidationResult = {
  valid: boolean;
  errors: string[];
};

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  // Minimum length
  if (password.length < 8) {
    errors.push("Password minimal 8 karakter");
  }

  // Maximum length (prevent DoS)
  if (password.length > 128) {
    errors.push("Password maksimal 128 karakter");
  }

  // At least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push("Password harus mengandung minimal 1 huruf besar");
  }

  // At least one lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push("Password harus mengandung minimal 1 huruf kecil");
  }

  // At least one number
  if (!/[0-9]/.test(password)) {
    errors.push("Password harus mengandung minimal 1 angka");
  }

  // At least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Password harus mengandung minimal 1 karakter spesial (!@#$%^&* dll)");
  }

  // Check for common passwords
  const commonPasswords = [
    "password", "password123", "12345678", "qwerty", "abc123",
    "password1", "admin", "letmein", "welcome", "monkey",
  ];

  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push("Password terlalu umum, gunakan kombinasi yang lebih unik");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function getPasswordStrength(password: string): {
  score: number; // 0-4
  label: string;
  color: string;
} {
  let score = 0;

  // Length
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;

  // Complexity
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;

  // Reduce score for common patterns
  if (/^[a-zA-Z]+$/.test(password)) score--; // Only letters
  if (/^[0-9]+$/.test(password)) score--; // Only numbers
  if (/(.)\1{2,}/.test(password)) score--; // Repeated characters

  score = Math.max(0, Math.min(4, score));

  const labels = ["Sangat Lemah", "Lemah", "Sedang", "Kuat", "Sangat Kuat"];
  const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#16a34a"];

  return {
    score,
    label: labels[score],
    color: colors[score],
  };
}

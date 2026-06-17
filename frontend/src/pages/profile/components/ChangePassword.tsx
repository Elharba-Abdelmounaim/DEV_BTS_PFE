// src/pages/profile/components/ChangePassword.tsx
import React, { useState } from 'react';
import type { ChangePasswordPayload } from '../../../types';
import styles from '../Profile.module.css';

interface ChangePasswordProps {
  onSubmit: (data: ChangePasswordPayload) => Promise<void>;
  loading: boolean;
  success?: string | null;
  error?: string | null;
}

export const ChangePassword: React.FC<ChangePasswordProps> = ({
  onSubmit,
  loading,
  success,
  error,
}) => {
  const [formData, setFormData] = useState<ChangePasswordPayload>({
    current_password: '',
    password: '',
    password_confirmation: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.password_confirmation) {
      return;
    }
    await onSubmit(formData);
    if (success) {
      setFormData({
        current_password: '',
        password: '',
        password_confirmation: '',
      });
    }
  };

  const passwordsMatch = formData.password === formData.password_confirmation;
  const passwordValid = formData.password.length >= 8;

  return (
    <form onSubmit={handleSubmit} className={styles.passwordForm}>
      <div className={styles.formSection}>
        <h3 className={styles.formTitle}>Change Password</h3>
        <p className={styles.formSubtitle}>
          Use a strong password with at least 8 characters
        </p>

        <div className={styles.formGroup}>
          <label htmlFor="current_password" className={styles.formLabel}>
            Current Password
          </label>
          <input
            id="current_password"
            name="current_password"
            type={showPassword ? 'text' : 'password'}
            value={formData.current_password}
            onChange={handleChange}
            className={styles.formInput}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="password" className={styles.formLabel}>
            New Password
          </label>
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            className={`${styles.formInput} ${formData.password && !passwordValid ? styles.inputError : ''}`}
            required
            minLength={8}
          />
          {formData.password && !passwordValid && (
            <span className={styles.inputHint}>Password must be at least 8 characters</span>
          )}
          {formData.password && passwordValid && (
            <span className={styles.inputSuccess}>✅ Strong password</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="password_confirmation" className={styles.formLabel}>
            Confirm New Password
          </label>
          <input
            id="password_confirmation"
            name="password_confirmation"
            type={showPassword ? 'text' : 'password'}
            value={formData.password_confirmation}
            onChange={handleChange}
            className={`${styles.formInput} ${formData.password_confirmation && !passwordsMatch ? styles.inputError : ''}`}
            required
          />
          {formData.password_confirmation && !passwordsMatch && (
            <span className={styles.inputHint}>Passwords do not match</span>
          )}
          {formData.password_confirmation && passwordsMatch && (
            <span className={styles.inputSuccess}>✅ Passwords match</span>
          )}
        </div>

        <div className={styles.passwordOptions}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
            />
            Show passwords
          </label>
        </div>
      </div>

      {success && (
        <div className={styles.successMessage}>
          <span>✅</span> {success}
        </div>
      )}
      {error && (
        <div className={styles.errorMessage}>
          <span>❌</span> {error}
        </div>
      )}

      <div className={styles.formActions}>
        <button
          type="submit"
          className={styles.saveBtn}
          disabled={loading || !passwordsMatch || !passwordValid || !formData.current_password}
        >
          {loading ? 'Changing...' : '🔒 Change Password'}
        </button>
      </div>
    </form>
  );
};
// src/pages/profile/components/ProfileForm.tsx
import React, { useState, useEffect } from 'react';
import type { User, UpdateProfilePayload } from '../../../types';
import styles from '../Profile.module.css';

interface ProfileFormProps {
  user: User | null;
  onSubmit: (data: UpdateProfilePayload) => Promise<void>;
  loading: boolean;
  success?: string | null;
  error?: string | null;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  user,
  onSubmit,
  loading,
  success,
  error,
}) => {
  const [formData, setFormData] = useState<UpdateProfilePayload>({
    first_name: '',
    last_name: '',
    email: '',
    github_username: '',
    bio: '',
    phone: '',
    location: '',
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isDirty, setIsDirty] = useState(false);

  // تحديث النموذج عند تغيير المستخدم
  useEffect(() => {
    if (user) {
      const newData = {
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        github_username: user.github_username || '',
        bio: (user as any).bio || '',
        phone: (user as any).phone || '',
        location: (user as any).location || '',
      };
      setFormData(newData);
      setIsDirty(false);
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setIsDirty(true);
    
    // Mark as touched on change
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // التحقق من صحة البيانات قبل الإرسال
    if (!formData.first_name?.trim() || !formData.last_name?.trim() || !formData.email?.trim()) {
      return;
    }
    
    await onSubmit(formData);
    if (success) {
      setIsDirty(false);
    }
  };

  const handleReset = () => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        github_username: user.github_username || '',
        bio: (user as any).bio || '',
        phone: (user as any).phone || '',
        location: (user as any).location || '',
      });
      setIsDirty(false);
      setTouched({});
    }
  };

  // التحقق من صحة الإيميل
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isEmailValid = !formData.email || isValidEmail(formData.email);

  return (
    <form onSubmit={handleSubmit} className={styles.profileForm}>
      {/* Header with status */}
      <div className={styles.formHeader}>
        <div>
          <h3 className={styles.formTitle}>✏️ Edit Profile</h3>
          <p className={styles.formSubtitle}>
            Update your personal information and how others see you
          </p>
        </div>
        {isDirty && (
          <span className={styles.unsavedBadge}>
            <span className={styles.unsavedDot} /> Unsaved changes
          </span>
        )}
      </div>

      <div className={styles.formSection}>
        {/* Name Row */}
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="first_name" className={styles.formLabel}>
              First Name <span className={styles.requiredStar}>*</span>
            </label>
            <input
              id="first_name"
              name="first_name"
              type="text"
              value={formData.first_name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${styles.formInput} ${
                touched.first_name && !formData.first_name?.trim() ? styles.inputError : ''
              }`}
              placeholder="Enter your first name"
              required
              disabled={loading}
            />
            {touched.first_name && !formData.first_name?.trim() && (
              <span className={styles.inputHint}>First name is required</span>
            )}
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="last_name" className={styles.formLabel}>
              Last Name <span className={styles.requiredStar}>*</span>
            </label>
            <input
              id="last_name"
              name="last_name"
              type="text"
              value={formData.last_name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${styles.formInput} ${
                touched.last_name && !formData.last_name?.trim() ? styles.inputError : ''
              }`}
              placeholder="Enter your last name"
              required
              disabled={loading}
            />
            {touched.last_name && !formData.last_name?.trim() && (
              <span className={styles.inputHint}>Last name is required</span>
            )}
          </div>
        </div>

        {/* Email */}
        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.formLabel}>
            Email Address <span className={styles.requiredStar}>*</span>
          </label>
          <div className={styles.inputWithIcon}>
            <span className={styles.inputIcon}>📧</span>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${styles.formInput} ${
                touched.email && !isEmailValid ? styles.inputError : ''
              }`}
              placeholder="your.email@example.com"
              required
              disabled={loading}
            />
          </div>
          {touched.email && !isEmailValid && (
            <span className={styles.inputHint}>Please enter a valid email address</span>
          )}
          {touched.email && isEmailValid && formData.email && (
            <span className={styles.inputSuccess}>✅ Valid email address</span>
          )}
        </div>

        {/* GitHub Username */}
        <div className={styles.formGroup}>
          <label htmlFor="github_username" className={styles.formLabel}>
            <span className={styles.labelIcon}>🐙</span> GitHub Username
          </label>
          <div className={styles.inputWithPrefix}>
            <span className={styles.inputPrefix}>github.com/</span>
            <input
              id="github_username"
              name="github_username"
              type="text"
              value={formData.github_username || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              className={styles.formInput}
              placeholder="your-username"
              disabled={loading}
            />
          </div>
          <span className={styles.inputHelper}>
            Connect your GitHub account to submit assignments
          </span>
        </div>

        {/* Bio */}
        <div className={styles.formGroup}>
          <label htmlFor="bio" className={styles.formLabel}>
            <span className={styles.labelIcon}>📝</span> Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`${styles.formTextarea} ${
              touched.bio && (formData.bio?.length || 0) > 500 ? styles.inputError : ''
            }`}
            rows={4}
            placeholder="Tell us about yourself, your skills, and what you're passionate about..."
            maxLength={500}
            disabled={loading}
          />
          <div className={styles.charCounter}>
            <span className={(formData.bio?.length || 0) > 400 ? styles.charWarning : ''}>
              {(formData.bio?.length || 0)}/500
            </span>
            {(formData.bio?.length || 0) > 450 && (
              <span className={styles.charWarning}>⚠️ Almost at limit</span>
            )}
          </div>
        </div>

        {/* Phone & Location */}
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="phone" className={styles.formLabel}>
              <span className={styles.labelIcon}>📱</span> Phone Number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              className={styles.formInput}
              placeholder="+212 6XX-XXXXXX"
              disabled={loading}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="location" className={styles.formLabel}>
              <span className={styles.labelIcon}>📍</span> Location
            </label>
            <input
              id="location"
              name="location"
              type="text"
              value={formData.location || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              className={styles.formInput}
              placeholder="City, Country"
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* Messages */}
      {success && (
        <div className={`${styles.message} ${styles.successMessage}`}>
          <span className={styles.messageIcon}>✅</span>
          <div>
            <p className={styles.messageTitle}>Success!</p>
            <p className={styles.messageText}>{success}</p>
          </div>
        </div>
      )}
      {error && (
        <div className={`${styles.message} ${styles.errorMessage}`}>
          <span className={styles.messageIcon}>❌</span>
          <div>
            <p className={styles.messageTitle}>Error</p>
            <p className={styles.messageText}>{error}</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className={styles.formActions}>
        <button
          type="submit"
          className={`${styles.saveBtn} ${isDirty ? styles.saveBtnActive : ''}`}
          disabled={loading || !isDirty}
        >
          {loading ? (
            <>
              <span className={styles.spinner} />
              Saving...
            </>
          ) : (
            <>💾 Save Changes</>
          )}
        </button>
        <button
          type="button"
          className={styles.resetBtn}
          onClick={handleReset}
          disabled={loading || !isDirty}
        >
          <span className={styles.resetIcon}>↺</span> Reset
        </button>
      </div>
    </form>
  );
};
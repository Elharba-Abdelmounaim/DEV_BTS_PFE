import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { me } from '../../../api/auth';
import { getMySubmissions } from '../../../api/assignments';
import { getMyEnrollments } from '../../../api/courses';
import client from '../../../api/client';  // ← أضف هذا السطر
import type { 
  User, 
  UpdateProfilePayload, 
  ChangePasswordPayload,
  ProfileStats 
} from '../../../types';


interface UseProfileReturn {
  user: User | null;
  stats: ProfileStats | null;
  loading: boolean;
  updating: boolean;
  error: string | null;
  success: string | null;
  updateProfile: (data: UpdateProfilePayload) => Promise<void>;
  changePassword: (data: ChangePasswordPayload) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  refresh: () => Promise<void>;
  clearMessages: () => void;
}

export function useProfile(): UseProfileReturn {
  const { user, setUser } = useAuth();
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // ✅ منع التحميل المتكرر
  const isMounted = useRef(true);
  const isLoadingRef = useRef(false);
  const initialLoadDone = useRef(false);

  const loadProfile = useCallback(async () => {
    // ✅ منع التحميل إذا كان already loading
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;

    try {
      setLoading(true);
      setError(null);

      // ✅ جلب البيانات مع معالجة الأخطاء بشكل فردي
      let userData: User | null = null;
      let submissions: any[] = [];
      let enrollments: any[] = [];

      try {
        userData = await me();
      } catch (err) {
        console.error('Failed to load user:', err);
        // إذا فشل جلب المستخدم، نستعمل الـ user من Context
        userData = user;
      }

      if (!userData) {
        throw new Error('No user data available');
      }

      // ✅ تحديث المستخدم فقط إذا تغير
      if (user?.id !== userData.id) {
        setUser(userData);
      }

      // جلب الـ submissions و enrollments مع معالجة الأخطاء
      try {
        submissions = await getMySubmissions();
      } catch (err) {
        console.error('Failed to load submissions:', err);
        submissions = [];
      }

      try {
        enrollments = await getMyEnrollments();
      } catch (err) {
        console.error('Failed to load enrollments:', err);
        enrollments = [];
      }

      if (!isMounted.current) return;

      // حساب الإحصائيات
      const graded = submissions.filter((s: any) => s.submission_status === 'graded');
      const avgScore = graded.length
        ? Math.round(graded.reduce((sum: number, s: any) => sum + (Number(s.final_score) || 0), 0) / graded.length)
        : null;

      setStats({
        totalCourses: enrollments.length,
        totalSubmissions: submissions.length,
        averageScore: avgScore,
        completedLessons: 0,
        totalLessons: 0,
        joinDate: userData.created_at || new Date().toISOString(),
      });

      initialLoadDone.current = true;

    } catch (err: any) {
      if (isMounted.current) {
        setError(err?.response?.data?.message || err?.message || 'Failed to load profile');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
        isLoadingRef.current = false;
      }
    }
  }, [user, setUser]);

  // تحديث الملف الشخصي
  const updateProfile = useCallback(async (data: UpdateProfilePayload) => {
    try {
      setUpdating(true);
      setError(null);
      setSuccess(null);

      // Clean empty strings to null or omit them to pass validation
      const payload = { ...data };
      Object.keys(payload).forEach(key => {
        if (payload[key as keyof UpdateProfilePayload] === '') {
          delete payload[key as keyof UpdateProfilePayload];
        }
      });

      const response = await client.put('/auth/update', payload);

      const result = response.data;
      const updatedUser = result.user || result.data || result;
      
      if (updatedUser && updatedUser.id) {
        setUser(updatedUser);
        setSuccess('Profile updated successfully!');
        // ✅ إعادة تحميل الإحصائيات فقط، ليس المستخدم
        await loadProfile();
      } else {
        throw new Error('Invalid response from server');
      }

    } catch (err: any) {
      setError(err?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  }, [setUser, loadProfile]);

  // تغيير كلمة المرور
  const changePassword = useCallback(async (data: ChangePasswordPayload) => {
    try {
      setUpdating(true);
      setError(null);
      setSuccess(null);

      // ✅ التحقق من تطابق كلمة المرور
      if (data.password !== data.password_confirmation) {
        throw new Error('Passwords do not match');
      }

      if (data.password.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }

      await client.post('/auth/change-password', data);

      setSuccess('Password changed successfully!');

    } catch (err: any) {
      setError(err?.message || 'Failed to change password');
    } finally {
      setUpdating(false);
    }
  }, []);

  // رفع الصورة
  const uploadAvatar = useCallback(async (file: File) => {
    try {
      setUpdating(true);
      setError(null);
      setSuccess(null);

      // ✅ التحقق من حجم الصورة
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image size must be less than 5MB');
      }

      const formData = new FormData();
      formData.append('avatar', file);

      const response = await client.post('/auth/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = response.data;
      const updatedUser = result.user || result.data || result;
      
      if (updatedUser && updatedUser.id) {
        setUser(updatedUser);
        setSuccess('Avatar updated successfully!');
        await loadProfile();
      } else {
        throw new Error('Invalid response from server');
      }

    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to upload avatar');
    } finally {
      setUpdating(false);
    }
  }, [setUser, loadProfile]);

  // تنظيف الرسائل
  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  // ✅ تحميل أولي مع منع التكرار
  useEffect(() => {
    isMounted.current = true;
    isLoadingRef.current = false;
    initialLoadDone.current = false;

    // تأخير صغير لتجنب الـ Conflict مع AuthContext
    const timer = setTimeout(() => {
      if (!initialLoadDone.current) {
        loadProfile();
      }
    }, 100);

    return () => {
      isMounted.current = false;
      clearTimeout(timer);
    };
  // ✅ إزالة loadProfile من dependencies لمنع الـ Infinite Loop
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    user,
    stats,
    loading,
    updating,
    error,
    success,
    updateProfile,
    changePassword,
    uploadAvatar,
    refresh: loadProfile,
    clearMessages,
  };
}
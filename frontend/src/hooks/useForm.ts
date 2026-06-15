import { useState, useCallback } from 'react';

interface UseFormOptions<T> {
  initialValues: T;
  onSubmit?: (values: T) => Promise<void>;
}

interface UseFormReturn<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  globalError: string;
  loading: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  setValues: (updates: Partial<T>) => void;
  setErrors: React.Dispatch<React.SetStateAction<Partial<Record<keyof T, string>>>>;
  setGlobalError: (error: string) => void;
  reset: () => void;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  onSubmit,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      const fieldValue = type === 'number' ? (value === '' ? '' : Number(value)) : value;
      setValuesState((prev) => ({ ...prev, [name]: fieldValue }));
      if (errors[name as keyof T]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[name as keyof T];
          return next;
        });
      }
    },
    [errors]
  );

  const setValues = useCallback((updates: Partial<T>) => {
    setValuesState((prev) => ({ ...prev, ...updates }));
  }, []);

  const reset = useCallback(() => {
    setValuesState(initialValues);
    setErrors({});
    setGlobalError('');
  }, [initialValues]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!onSubmit) return;
      setGlobalError('');
      setLoading(true);
      try {
        await onSubmit(values);
      } catch (err: any) {
        if (err?.response?.data?.errors) {
          const apiErrors = err.response.data.errors;
          const mapped: Partial<Record<keyof T, string>> = {};
          for (const key in apiErrors) {
            mapped[key as keyof T] = Array.isArray(apiErrors[key])
              ? apiErrors[key][0]
              : apiErrors[key];
          }
          setErrors(mapped);
        } else {
          setGlobalError(err?.response?.data?.message || 'Une erreur est survenue');
        }
      } finally {
        setLoading(false);
      }
    },
    [values, onSubmit]
  );

  return {
    values,
    errors,
    globalError,
    loading,
    handleChange,
    handleSubmit,
    setValues,
    setErrors,
    setGlobalError,
    reset,
  };
}
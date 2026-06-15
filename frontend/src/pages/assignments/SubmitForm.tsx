import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from '../../hooks/useForm';
import { submitAssignment } from '../../api/assignments';
import Input from '../../components/ui/Input';
import styles from './SubmitForm.module.css';

const GITHUB_URL_REGEX = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/i;
const BRANCH_REGEX = /^[\w.\-\/]+$/;
const SHA_REGEX = /^[a-f0-9]{7,40}$/i;

export default function SubmitForm() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const [globalError, setGlobalError] = useState('');

  const { values, errors, loading, handleChange, setErrors } = useForm({
    initialValues: {
      github_url: '',
      branch: 'main',
      commit_sha: '',
    }
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!GITHUB_URL_REGEX.test(values.github_url)) {
      newErrors.github_url = 'URL GitHub invalide (ex: https://github.com/user/repo)';
    }
    if (!BRANCH_REGEX.test(values.branch)) {
      newErrors.branch = 'Nom de branche invalide';
    }
    if (!SHA_REGEX.test(values.commit_sha)) {
      newErrors.commit_sha = 'SHA invalide (7-40 caractères hexadécimaux)';
    }
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError('');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const result = await submitAssignment(assignmentId!, {
        github_url: values.github_url,
        branch: values.branch,
        commit_sha: values.commit_sha,
      });
      navigate(`/submissions/${result.id}`);
    } catch (err: any) {
      if (err?.response?.data?.errors) {
        const apiErrors = err.response.data.errors;
        const mapped: Record<string, string> = {};
        for (const key in apiErrors) {
          mapped[key] = Array.isArray(apiErrors[key]) ? apiErrors[key][0] : apiErrors[key];
        }
        setErrors(mapped);
      } else {
        setGlobalError(err?.response?.data?.message || 'Erreur lors de la soumission');
      }
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1>Soumettre un devoir</h1>
        <p className={styles.subtitle}>
          Entrez les informations de votre commit GitHub
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          {globalError && <div className={styles.globalError}>{globalError}</div>}

          <Input
            label="URL du dépôt GitHub"
            name="github_url"
            value={values.github_url}
            onChange={handleChange}
            error={errors.github_url}
            hint="Ex: https://github.com/username/repository"
            placeholder="https://github.com/..."
            required
          />

          <Input
            label="Branche"
            name="branch"
            value={values.branch}
            onChange={handleChange}
            error={errors.branch}
            hint="La branche contenant votre travail"
            placeholder="main"
            required
          />

          <Input
            label="SHA du commit"
            name="commit_sha"
            value={values.commit_sha}
            onChange={handleChange}
            error={errors.commit_sha}
            hint="Le hash du commit à évaluer (7-40 caractères)"
            placeholder="a1b2c3d..."
            required
          />

          <div className={styles.actions}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className={styles.cancelBtn}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className={styles.submitBtn}
            >
              {loading ? 'Envoi...' : 'Soumettre'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
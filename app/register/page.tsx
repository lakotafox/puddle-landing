'use client';

/**
 * Company registration page. Bootstraps a new employer + first admin employee
 * + user account, then logs the user in and redirects to the dashboard.
 *
 * 6-step React Bits <Stepper /> wizard; the submitted payload is identical to
 * the old single-page form (confirm fields are frontend-only and never sent).
 * Validation runs in the stepper's onBeforeNext hook since its nav buttons
 * live outside a <form> (no native browser validation).
 */
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { useAuth } from '@/lib/auth';
import type { RegisterEmployerRequest } from '@/lib/types';
import AuthBackdrop from '@/components/AuthBackdrop';
import Stepper, { Step } from '@/components/reactbits/Stepper/Stepper';
import styles from '@/styles/Auth.module.css';

const EMPTY: RegisterEmployerRequest = {
  company_name: '',
  company_email: '',
  company_phone: '',
  company_address: '',
  first_name: '',
  last_name: '',
  admin_email: '',
  admin_phone: '',
  password: '',
};

// Mirrors the backend's EmailStr rule closely enough to catch the common
// case the browser allows but the API rejects (domain without a dot).
const EMAIL_RE = /^\S+@\S+\.\S+$/;

export default function RegisterPage() {
  const router = useRouter();
  const { registerEmployer } = useAuth();

  const [form, setForm] = useState<RegisterEmployerRequest>(EMPTY);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // TEMPORARY A/B toggle for the card look — remove once we pick a direction.
  const [cardTheme, setCardTheme] = useState<'dark' | 'light'>('dark');

  const update = (field: keyof RegisterEmployerRequest) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  // Gate each step; on the last step, submit. Return false to block the move.
  const handleBeforeNext = async (step: number): Promise<boolean> => {
    if (submitting) return false; // guard double-submit via Enter key
    setError(null);

    switch (step) {
      case 1:
        if (!form.company_name.trim()) {
          setError('Company name is required.');
          return false;
        }
        return true;
      case 2:
        if (!EMAIL_RE.test(form.company_email.trim())) {
          setError('Enter a valid company email (like hq@acme.com).');
          return false;
        }
        return true;
      case 3:
        return true; // address is optional
      case 4:
        if (!form.first_name.trim() || !form.last_name.trim()) {
          setError('First and last name are required.');
          return false;
        }
        return true;
      case 5:
        if (!EMAIL_RE.test(form.admin_email.trim())) {
          setError('Enter a valid email (like you@acme.com).');
          return false;
        }
        if (form.admin_email.trim() !== confirmEmail.trim()) {
          setError('Emails do not match.');
          return false;
        }
        return true;
      case 6: {
        if (form.password.length < 8) {
          setError('Password must be at least 8 characters.');
          return false;
        }
        if (form.password !== confirmPassword) {
          setError('Passwords do not match.');
          return false;
        }
        setSubmitting(true);
        try {
          await registerEmployer(form);
          router.replace('/dashboard');
          return true;
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Registration failed');
          return false;
        } finally {
          setSubmitting(false);
        }
      }
      default:
        return true;
    }
  };

  return (
    <div className={styles.wrapper}>
      <AuthBackdrop />
      <div
        className={`${styles.stepperShell} ${
          cardTheme === 'light' ? styles.shellLight : ''
        }`}
      >
        <h1 className={styles.titleOnDark}>Register your company</h1>

        <div className={styles.themeToggle}>
          <button
            type="button"
            className={cardTheme === 'dark' ? styles.themeChoiceActive : styles.themeChoice}
            onClick={() => setCardTheme('dark')}
          >
            Dark
          </button>
          <button
            type="button"
            className={cardTheme === 'light' ? styles.themeChoiceActive : styles.themeChoice}
            onClick={() => setCardTheme('light')}
          >
            Light
          </button>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <Stepper
          initialStep={1}
          theme={cardTheme}
          onBeforeNext={handleBeforeNext}
          backButtonText="Back"
          nextButtonText="Next"
          completeButtonText={submitting ? 'Creating…' : 'Create company'}
          nextButtonProps={{ disabled: submitting }}
          disableStepIndicators
        >
          <Step>
            <h2 className={styles.stepTitle}>What&apos;s your company called?</h2>
            <div className={styles.field}>
              <label className={styles.labelOnDark}>Company name</label>
              <input
                className={styles.input}
                value={form.company_name}
                onChange={update('company_name')}
                placeholder="Acme Corp"
              />
            </div>
          </Step>

          <Step>
            <h2 className={styles.stepTitle}>How do we reach the company?</h2>
            <div className={styles.field}>
              <label className={styles.labelOnDark}>Company email</label>
              <input
                className={styles.input}
                type="email"
                value={form.company_email}
                onChange={update('company_email')}
                placeholder="hq@acme.com"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.labelOnDark}>Company phone (optional)</label>
              <input
                className={styles.input}
                value={form.company_phone}
                onChange={update('company_phone')}
                placeholder="(555) 555-5555"
              />
            </div>
          </Step>

          <Step>
            <h2 className={styles.stepTitle}>Where are you located?</h2>
            <div className={styles.field}>
              <label className={styles.labelOnDark}>Address (optional)</label>
              <input
                className={styles.input}
                value={form.company_address}
                onChange={update('company_address')}
                placeholder="123 Main St, Salt Lake City"
              />
            </div>
          </Step>

          <Step>
            <h2 className={styles.stepTitle}>Who&apos;s the admin?</h2>
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.labelOnDark}>First name</label>
                <input
                  className={styles.input}
                  value={form.first_name}
                  onChange={update('first_name')}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.labelOnDark}>Last name</label>
                <input
                  className={styles.input}
                  value={form.last_name}
                  onChange={update('last_name')}
                />
              </div>
            </div>
          </Step>

          <Step>
            <h2 className={styles.stepTitle}>Your login email</h2>
            <div className={styles.field}>
              <label className={styles.labelOnDark}>Admin email</label>
              <input
                className={styles.input}
                type="email"
                value={form.admin_email}
                onChange={update('admin_email')}
                placeholder="you@acme.com"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.labelOnDark}>Confirm email</label>
              <input
                className={styles.input}
                type="email"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                placeholder="Type it again"
              />
            </div>
          </Step>

          <Step>
            <h2 className={styles.stepTitle}>Set your password</h2>
            <div className={styles.field}>
              <label className={styles.labelOnDark}>Password</label>
              <input
                className={styles.input}
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={update('password')}
                placeholder="At least 8 characters"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.labelOnDark}>Confirm password</label>
              <input
                className={styles.input}
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Type it again"
              />
            </div>
          </Step>
        </Stepper>

        <p className={styles.footerOnDark}>
          Already have an account?{' '}
          <Link className={styles.link} href="/login">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

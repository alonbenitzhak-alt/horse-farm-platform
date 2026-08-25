import { useState } from 'react';
import { loginUser, getSupabaseClient } from '@stableos/shared';
import { useTranslation } from '../hooks/useTranslation';
import { success, error as showError } from '../utils/toast';
import '../styles/auth.css';

interface LoginProps {
  onSuccess: () => void;
  onSwitchToRegister: () => void;
}

export default function Login({ onSuccess, onSwitchToRegister }: LoginProps) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg(t('auth.requiredFields'));
      return;
    }

    try {
      setLoading(true);
      await loginUser(email, password);
      success(t('auth.loginSuccess'));
      onSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('auth.loginFailed');
      setErrorMsg(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    try {
      setLoading(true);
      setErrorMsg(null);
      const client = getSupabaseClient();
      const { error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}`,
        },
      });
      if (error) throw error;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Google sign-in failed';
      setErrorMsg(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header">
          <h1>🐎 StableOS</h1>
          <p>{t('auth.loginSubtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>{t('auth.email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth.emailPlaceholder')}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label>{t('auth.password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('auth.passwordPlaceholder')}
              disabled={loading}
              required
            />
          </div>

          {errorMsg && <div className="error-message">{errorMsg}</div>}

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? t('auth.loggingIn') : t('auth.login')}
          </button>

          <div className="divider">או</div>

          <button
            type="button"
            className="oauth-button google"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <span className="oauth-icon">🔍</span>
            התחבר עם Google
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {t('auth.noAccount')}{' '}
            <button
              type="button"
              className="link-button"
              onClick={onSwitchToRegister}
              disabled={loading}
            >
              {t('auth.register')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

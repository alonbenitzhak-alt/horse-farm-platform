import { useState } from 'react';
import { registerUser, joinFarmWithCode, getSupabaseClient } from '@stableos/shared';
import { useTranslation } from '../hooks/useTranslation';
import { success, error as showError } from '../utils/toast';
import '../styles/auth.css';

interface RegisterProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

type UserRole = 'manager' | 'worker';
type ManagerAction = 'create' | 'join';

export default function Register({ onSuccess, onSwitchToLogin }: RegisterProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState<'role' | 'form'>('role');
  const [role, setRole] = useState<UserRole>('manager');
  const [managerAction, setManagerAction] = useState<ManagerAction>('create');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [farmName, setFarmName] = useState('');
  const [farmCode, setFarmCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMsg('כל השדות חובה');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('הסיסמאות אינן תואמות');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('הסיסמה חייבת להיות 6 תווים לפחות');
      return;
    }

    if (!email.includes('@')) {
      setErrorMsg('כתובת אימייל לא חוקית');
      return;
    }

    try {
      setLoading(true);

      if (role === 'manager') {
        if (managerAction === 'create') {
          if (!farmName.trim()) {
            setErrorMsg('שם החוות חובה');
            return;
          }
          await registerUser(email, password, name, farmName);
        } else {
          if (!farmCode.trim()) {
            setErrorMsg('קוד החוות חובה');
            return;
          }
          await joinFarmWithCode(email, password, name, farmCode, 'manager');
        }
      } else {
        if (!farmCode.trim()) {
          setErrorMsg('קוד החוות חובה');
          return;
        }
        await joinFarmWithCode(email, password, name, farmCode, 'staff');
      }

      success('הרשמה בוצעה בהצלחה!');
      onSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'הרשמה נכשלה';
      setErrorMsg(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignUp() {
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
      const msg = err instanceof Error ? err.message : 'Google sign-up failed';
      setErrorMsg(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  }

  if (step === 'role') {
    return (
      <div className="auth-container">
        <div className="auth-box">
          <div className="auth-header">
            <h1>🐎 StableOS</h1>
            <p>בחר את תפקידך</p>
          </div>

          <div className="role-selection">
            <button
              className={`role-button ${role === 'manager' ? 'selected' : ''}`}
              onClick={() => {
                setRole('manager');
                setManagerAction('create');
              }}
            >
              <div className="role-icon">⚡</div>
              <div className="role-title">מנהל חוות</div>
              <div className="role-description">צור חוות חדשה או הצטרף לקיימת</div>
            </button>

            <button
              className={`role-button ${role === 'worker' ? 'selected' : ''}`}
              onClick={() => setRole('worker')}
            >
              <div className="role-icon">👤</div>
              <div className="role-title">עובד</div>
              <div className="role-description">הצטרף לחוות עם קוד</div>
            </button>
          </div>

          {role === 'manager' && (
            <div className="manager-action-selection">
              <button
                className={`action-button ${managerAction === 'create' ? 'active' : ''}`}
                onClick={() => setManagerAction('create')}
              >
                ✚ יצור חוות חדשה
              </button>
              <button
                className={`action-button ${managerAction === 'join' ? 'active' : ''}`}
                onClick={() => setManagerAction('join')}
              >
                ➜ הצטרף לחוות קיימת
              </button>
            </div>
          )}

          <button
            className="submit-button"
            onClick={() => setStep('form')}
            disabled={loading}
          >
            המשך
          </button>

          <div className="divider">או</div>

          <button
            type="button"
            className="oauth-button google"
            onClick={handleGoogleSignUp}
            disabled={loading}
          >
            <span className="oauth-icon">🔍</span>
            הרשם עם Google
          </button>

          <div className="auth-footer">
            <p>
              יש לך חשבון כבר?{' '}
              <button
                type="button"
                className="link-button"
                onClick={onSwitchToLogin}
                disabled={loading}
              >
                התחבר
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header">
          <h1>🐎 StableOS</h1>
          <p>
            {role === 'manager' && managerAction === 'create' && 'צור חוות חדשה'}
            {role === 'manager' && managerAction === 'join' && 'הצטרף לחוות'}
            {role === 'worker' && 'הצטרף לחוות'}
          </p>
          <button
            className="back-button"
            onClick={() => setStep('role')}
            disabled={loading}
          >
            ← חזור
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>שמך</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="שם מלא"
              disabled={loading}
              required
            />
          </div>

          {role === 'manager' && managerAction === 'create' && (
            <div className="form-group">
              <label>שם החוות</label>
              <input
                type="text"
                value={farmName}
                onChange={(e) => setFarmName(e.target.value)}
                placeholder="שם החוות שלך"
                disabled={loading}
                required
              />
            </div>
          )}

          {(managerAction === 'join' || role === 'worker') && (
            <div className="form-group">
              <label>קוד החוות</label>
              <input
                type="text"
                value={farmCode}
                onChange={(e) => setFarmCode(e.target.value)}
                placeholder="לדוגמה: FARM-ABC123"
                disabled={loading}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>אימייל</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label>סיסמה</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="לפחות 6 תווים"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label>אישור סיסמה</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="חזור על הסיסמה"
              disabled={loading}
              required
            />
          </div>

          {errorMsg && <div className="error-message">{errorMsg}</div>}

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'טוען...' : 'הרשם'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            יש לך חשבון כבר?{' '}
            <button
              type="button"
              className="link-button"
              onClick={onSwitchToLogin}
              disabled={loading}
            >
              התחבר
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

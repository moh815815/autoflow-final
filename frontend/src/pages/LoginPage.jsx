// frontend/src/pages/LoginPage.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

const S = {
  page: { minHeight: '100vh', background: 'linear-gradient(135deg,#0a0f1e 0%,#1a2d5a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cairo',sans-serif", direction: 'rtl' },
  card: { background: '#fff', borderRadius: 22, padding: '38px 36px', width: 420, maxWidth: '92vw', boxShadow: '0 24px 64px rgba(0,0,0,.3)' },
  logo: { display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 26 },
  logoIcon: { width: 44, height: 44, background: 'linear-gradient(135deg,#c8a96e,#a07840)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 },
  title: { fontSize: 22, fontWeight: 900, textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 26 },
  label: { fontSize: 12, fontWeight: 700, color: '#6b7280', display: 'block', marginBottom: 4 },
  input: { width: '100%', padding: '10px 13px', border: '1.5px solid #e8e4dc', borderRadius: 10, fontFamily: "'Cairo',sans-serif", fontSize: 14, marginBottom: 14, outline: 'none', transition: 'border-color .2s' },
  btn: { width: '100%', padding: 13, background: '#0a0f1e', color: '#fff', border: 'none', borderRadius: 10, fontFamily: "'Cairo',sans-serif", fontSize: 15, fontWeight: 800, cursor: 'pointer', transition: 'all .2s', marginTop: 4 },
  divider: { textAlign: 'center', color: '#9ca3af', fontSize: 12, margin: '16px 0', position: 'relative' },
  demo: { display: 'flex', gap: 8 },
  demoBtn: { flex: 1, padding: '8px 4px', border: '1.5px solid #e8e4dc', background: '#fff', borderRadius: 9, fontFamily: "'Cairo',sans-serif", fontSize: 12, fontWeight: 600, cursor: 'pointer', textAlign: 'center' },
  footer: { textAlign: 'center', fontSize: 12, color: '#9ca3af', marginTop: 20 },
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success('مرحباً! تم تسجيل الدخول');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const demoLogin = async (demoEmail) => {
    try {
      await login(demoEmail, 'Demo@1234');
      toast.success('دخول تجريبي');
      navigate('/dashboard');
    } catch {
      toast.error('تحقق من تشغيل السيرفر وبيانات الـ Seed');
    }
  };

  return (
    <div style={S.page}>
      <div style={S.card}>
        <div style={S.logo}>
          <div style={S.logoIcon}>⚡</div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900 }}>أوتوفلو</div>
            <div style={{ fontSize: 10, color: '#c8a96e', letterSpacing: 1 }}>AUTOFLOW PRO</div>
          </div>
        </div>
        <div style={S.title}>مرحباً بعودتك 👋</div>
        <div style={S.sub}>سجّل دخولك لإدارة أتمتة شركتك</div>

        <form onSubmit={handleLogin}>
          <label style={S.label}>البريد الإلكتروني</label>
          <input style={S.input} type="email" placeholder="ahmed@company.sa"
            value={email} onChange={e => setEmail(e.target.value)} required
            onFocus={e => e.target.style.borderColor = '#c8a96e'}
            onBlur={e => e.target.style.borderColor = '#e8e4dc'} />
          <label style={S.label}>كلمة المرور</label>
          <input style={S.input} type="password" placeholder="••••••••"
            value={password} onChange={e => setPassword(e.target.value)} required
            onFocus={e => e.target.style.borderColor = '#c8a96e'}
            onBlur={e => e.target.style.borderColor = '#e8e4dc'} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16, marginTop: -8 }}>
            <span style={{ fontSize: 12, color: '#1a3a6b', cursor: 'pointer', fontWeight: 600 }}>نسيت كلمة المرور؟</span>
          </div>
          <button style={S.btn} type="submit" disabled={isLoading}
            onMouseEnter={e => { if (!isLoading) e.target.style.background = '#1a3a6b'; }}
            onMouseLeave={e => e.target.style.background = '#0a0f1e'}>
            {isLoading ? '...' : '⚡ تسجيل الدخول'}
          </button>
        </form>

        <div style={S.divider}>
          <span style={{ background: '#fff', padding: '0 12px', position: 'relative', zIndex: 1 }}>أو جرّب النسخة التجريبية</span>
          <div style={{ position: 'absolute', top: '50%', right: 0, left: 0, height: 1, background: '#f0ece4', zIndex: 0, transform: 'translateY(-50%)' }} />
        </div>
        <div style={S.demo}>
          <button style={S.demoBtn} onClick={() => demoLogin('admin@alamal.sa')}>🏢 مدير</button>
          <button style={S.demoBtn} onClick={() => demoLogin('sara@alamal.sa')}>👥 HR</button>
          <button style={S.demoBtn} onClick={() => demoLogin('fahad@alamal.sa')}>💰 محاسب</button>
        </div>
        <div style={S.footer}>
          ليس لديك حساب؟ <Link to="/register" style={{ color: '#1a3a6b', fontWeight: 700 }}>ابدأ مجاناً 14 يوم</Link>
        </div>
      </div>
    </div>
  );
}

// frontend/src/pages/RegisterPage.jsx
import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import Onboarding from '../components/Onboarding';

export default function RegisterPage() {
  const [params] = useSearchParams();
  const [form, setForm] = useState({ company_name: '', name: '', email: '', password: '', phone: '', plan: params.get('plan') || 'starter' });
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleRegister = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) { toast.error('كلمة المرور يجب أن تكون 8 أحرف على الأقل'); return; }
    try {
      await register(form);
      toast.success('تم إنشاء الحساب! مرحباً بك في أوتوفلو 🎉');
      setShowOnboarding(true);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const s = { input: { width: '100%', padding: '10px 13px', border: '1.5px solid #e8e4dc', borderRadius: 10, fontFamily: "'Cairo',sans-serif", fontSize: 14, marginBottom: 12, outline: 'none' }, label: { fontSize: 12, fontWeight: 700, color: '#6b7280', display: 'block', marginBottom: 4 } };

  if (showOnboarding) return <Onboarding onComplete={() => navigate('/dashboard')} />;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0a0f1e,#1a2d5a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cairo',sans-serif", direction: 'rtl' }}>
      <div style={{ background: '#fff', borderRadius: 22, padding: '36px', width: 460, maxWidth: '92vw', boxShadow: '0 24px 64px rgba(0,0,0,.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 20 }}>
          <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg,#c8a96e,#a07840)', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>⚡</div>
          <div style={{ fontSize: 20, fontWeight: 900 }}>أنشئ حسابك مجاناً</div>
        </div>

        {/* Plan badge */}
        <div style={{ background: '#fdf8ef', border: '1px solid #e8d4a8', borderRadius: 10, padding: '10px 14px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 700 }}>{form.plan === 'pro' ? '⚡ خطة Pro' : '🚀 خطة Starter'}</span>
          <span style={{ fontSize: 11, background: '#c8a96e', color: '#0a0f1e', padding: '2px 10px', borderRadius: 8, fontWeight: 700 }}>14 يوم مجاناً</span>
        </div>

        <form onSubmit={handleRegister}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
            <div>
              <label style={s.label}>اسم الشركة</label>
              <input style={s.input} placeholder="شركة الأمل" value={form.company_name} onChange={e => set('company_name', e.target.value)} required />
            </div>
            <div>
              <label style={s.label}>اسمك الكامل</label>
              <input style={s.input} placeholder="أحمد الشمري" value={form.name} onChange={e => set('name', e.target.value)} required />
            </div>
          </div>
          <label style={s.label}>البريد الإلكتروني</label>
          <input style={s.input} type="email" placeholder="ahmed@company.sa" value={form.email} onChange={e => set('email', e.target.value)} required />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
            <div>
              <label style={s.label}>كلمة المرور</label>
              <input style={s.input} type="password" placeholder="8+ أحرف" value={form.password} onChange={e => set('password', e.target.value)} required />
            </div>
            <div>
              <label style={s.label}>رقم الجوال</label>
              <input style={s.input} type="tel" placeholder="+966 5x xxx xxxx" value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
          </div>
          <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 14 }}>
            بالتسجيل تقبل <span style={{ color: '#1a3a6b', cursor: 'pointer' }}>شروط الاستخدام</span> و<span style={{ color: '#1a3a6b', cursor: 'pointer' }}>سياسة الخصوصية</span>
          </div>
          <button type="submit" disabled={isLoading}
            style={{ width: '100%', padding: 12, background: '#0a0f1e', color: '#fff', border: 'none', borderRadius: 10, fontFamily: "'Cairo',sans-serif", fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
            {isLoading ? '...' : '🚀 إنشاء الحساب مجاناً'}
          </button>
        </form>
        <div style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', marginTop: 16 }}>
          لديك حساب؟ <Link to="/login" style={{ color: '#1a3a6b', fontWeight: 700 }}>تسجيل الدخول</Link>
        </div>
      </div>
    </div>
  );
}

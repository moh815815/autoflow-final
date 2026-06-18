// frontend/src/components/Onboarding.jsx
// ============================================
// معالج الإعداد الأولي للشركة الجديدة
// ============================================
import { useState } from 'react';
import { integrationsAPI, workflowsAPI } from '../services/api';
import useAuthStore from '../store/authStore';

const STEPS = [
  { id: 1, title: 'مرحباً بك! 🎉',         icon: '🚀' },
  { id: 2, title: 'أخبرنا عن شركتك',       icon: '🏢' },
  { id: 3, title: 'ربط أنظمتك',            icon: '🔗' },
  { id: 4, title: 'أول سير عمل',           icon: '⚡' },
  { id: 5, title: 'جاهز للانطلاق!',        icon: '✅' },
];

const Onboarding = ({ onComplete }) => {
  const { user } = useAuthStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    industry: '',
    team_size: '',
    main_challenge: '',
    selected_integration: null,
    selected_template: null,
  });

  const next = () => setStep(s => Math.min(s + 1, STEPS.length));
  const prev = () => setStep(s => Math.max(s - 1, 1));

  const createFirstWorkflow = async () => {
    if (!data.selected_template) { next(); return; }
    setLoading(true);
    try {
      const templates = await workflowsAPI.templates();
      const tmpl = templates.templates.find(t => t.category === data.selected_template);
      if (tmpl) {
        await workflowsAPI.useTemplate(tmpl.id, { name: tmpl.name_ar });
      }
    } catch {}
    setLoading(false);
    next();
  };

  const s = STEPS[step - 1];
  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(10,15,30,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, backdropFilter: 'blur(6px)',
    }}>
      <div style={{
        background: 'white', borderRadius: 24, padding: '40px',
        width: 520, maxWidth: '92vw', direction: 'rtl',
        fontFamily: "'Cairo', sans-serif",
      }}>
        {/* Progress bar */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            {STEPS.map(s2 => (
              <div key={s2.id} style={{
                width: 32, height: 32, borderRadius: '50%',
                background: s2.id <= step ? '#0a0f1e' : '#e8e6e0',
                color: s2.id <= step ? 'white' : '#8a8f9a',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, transition: 'all 0.3s',
              }}>{s2.id <= step ? (s2.id < step ? '✓' : s2.id) : s2.id}</div>
            ))}
          </div>
          <div style={{ height: 4, background: '#e8e6e0', borderRadius: 2 }}>
            <div style={{ height: '100%', background: '#c8a96e', borderRadius: 2, width: `${progress}%`, transition: 'width 0.4s ease' }} />
          </div>
        </div>

        <div style={{ fontSize: 36, textAlign: 'center', marginBottom: 8 }}>{s.icon}</div>
        <h2 style={{ fontSize: 22, fontWeight: 900, textAlign: 'center', marginBottom: 20 }}>{s.title}</h2>

        {/* STEP 1 - Welcome */}
        {step === 1 && (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#8a8f9a', fontSize: 14, lineHeight: 1.8, marginBottom: 24 }}>
              مرحباً <b>{user?.name}</b>! أوتوفلو سيوفّر لك ساعات من العمل اليدوي كل أسبوع.
              سنساعدك في الإعداد خلال 3 دقائق فقط.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
              {[['⚡','أتمتة فورية'],['🔗','ربط أنظمتك'],['📊','تقارير حية']].map(([icon, label]) => (
                <div key={label} style={{ background: '#f5f2eb', borderRadius: 12, padding: '14px 8px', textAlign: 'center' }}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>{icon}</div>
                  <div style={{ fontSize: 11, fontWeight: 700 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2 - Company Info */}
        {step === 2 && (
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#8a8f9a', display: 'block', marginBottom: 4 }}>قطاع شركتك</label>
            <select
              value={data.industry}
              onChange={e => setData(d => ({ ...d, industry: e.target.value }))}
              style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #d8d2c8', borderRadius: 10, fontFamily: "'Cairo',sans-serif", fontSize: 14, marginBottom: 14 }}
            >
              <option value="">اختر القطاع</option>
              <option>تجارة التجزئة</option>
              <option>التجارة الإلكترونية</option>
              <option>المقاولات والبناء</option>
              <option>الخدمات المهنية</option>
              <option>الصناعة والتصنيع</option>
              <option>الصحة والطب</option>
              <option>التعليم</option>
              <option>أخرى</option>
            </select>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#8a8f9a', display: 'block', marginBottom: 4 }}>حجم الفريق</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 14 }}>
              {['1-5','6-20','21-50','50+'].map(size => (
                <div key={size} onClick={() => setData(d => ({ ...d, team_size: size }))}
                  style={{ padding: '10px 4px', border: `2px solid ${data.team_size === size ? '#c8a96e' : '#d8d2c8'}`, background: data.team_size === size ? '#fdf8ef' : 'white', borderRadius: 10, textAlign: 'center', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
                  {size}
                </div>
              ))}
            </div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#8a8f9a', display: 'block', marginBottom: 4 }}>أكبر تحدي يدوي عندك</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['متابعة الطلبات والشحن','حساب الرواتب والحضور','متابعة العملاء والفواتير','إدارة المخزون'].map(c => (
                <div key={c} onClick={() => setData(d => ({ ...d, main_challenge: c }))}
                  style={{ padding: '10px 14px', border: `2px solid ${data.main_challenge === c ? '#1a3a6b' : '#d8d2c8'}`, background: data.main_challenge === c ? '#e8eef8' : 'white', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                  {c}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3 - Integration */}
        {step === 3 && (
          <div>
            <p style={{ color: '#8a8f9a', fontSize: 13, marginBottom: 16 }}>اربط نظامك الأول الآن (يمكن تخطي هذه الخطوة)</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { id: 'erp', icon: '🏢', name: 'نظام ERP' },
                { id: 'fingerprint', icon: '👆', name: 'جهاز البصمة' },
                { id: 'whatsapp', icon: '💬', name: 'واتساب بيزنس' },
                { id: 'aramex', icon: '📦', name: 'أرامكس' },
                { id: 'bank', icon: '🏦', name: 'بنك / محفظة' },
                { id: 'zatca', icon: '🧾', name: 'زاتكا' },
              ].map(int => (
                <div key={int.id} onClick={() => setData(d => ({ ...d, selected_integration: int.id }))}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', border: `2px solid ${data.selected_integration === int.id ? '#c8a96e' : '#d8d2c8'}`, background: data.selected_integration === int.id ? '#fdf8ef' : 'white', borderRadius: 12, cursor: 'pointer' }}>
                  <span style={{ fontSize: 20 }}>{int.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{int.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4 - First Workflow */}
        {step === 4 && (
          <div>
            <p style={{ color: '#8a8f9a', fontSize: 13, marginBottom: 16 }}>اختر أول سير عمل تريد تفعيله:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { id: 'sales', icon: '🛒', name: 'طلب → شحن → إشعار العميل', desc: 'الأكثر شعبية' },
                { id: 'hr', icon: '⏰', name: 'حضور → حساب الراتب', desc: 'يوفّر 10+ ساعات شهرياً' },
                { id: 'finance', icon: '💰', name: 'فاتورة → تذكير → تحصيل', desc: 'يحسّن التحصيل 30%' },
                { id: 'inventory', icon: '📦', name: 'مخزون منخفض → طلب شراء', desc: 'صفر نفاد مخزون' },
              ].map(tmpl => (
                <div key={tmpl.id} onClick={() => setData(d => ({ ...d, selected_template: tmpl.id }))}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', border: `2px solid ${data.selected_template === tmpl.id ? '#1a3a6b' : '#d8d2c8'}`, background: data.selected_template === tmpl.id ? '#e8eef8' : 'white', borderRadius: 12, cursor: 'pointer' }}>
                  <span style={{ fontSize: 24 }}>{tmpl.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{tmpl.name}</div>
                    <div style={{ fontSize: 11, color: '#1a6b4a', fontWeight: 600 }}>{tmpl.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 5 - Done */}
        {step === 5 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 60, marginBottom: 12 }}>🎉</div>
            <p style={{ color: '#8a8f9a', fontSize: 14, lineHeight: 1.8, marginBottom: 16 }}>
              حسابك جاهز! لديك <b>14 يوم تجريبي مجاناً</b>. يمكنك الآن الدخول للوحة التحكم وتفعيل أول سير عمل.
            </p>
            <div style={{ background: '#e8f5ee', borderRadius: 12, padding: '14px 20px', marginBottom: 16, textAlign: 'right' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1a6b4a', marginBottom: 4 }}>✅ ما تم إعداده:</div>
              {data.industry && <div style={{ fontSize: 12, color: '#1a6b4a' }}>• القطاع: {data.industry}</div>}
              {data.selected_integration && <div style={{ fontSize: 12, color: '#1a6b4a' }}>• تكامل جاهز للإعداد: {data.selected_integration}</div>}
              {data.selected_template && <div style={{ fontSize: 12, color: '#1a6b4a' }}>• سير عمل أول: مضاف ✓</div>}
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
          {step > 1 && step < STEPS.length && (
            <button onClick={prev} style={{ padding: '10px 20px', border: '1.5px solid #d8d2c8', background: 'white', borderRadius: 10, fontFamily: "'Cairo',sans-serif", fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              رجوع
            </button>
          )}
          {step < STEPS.length - 1 && (
            <button onClick={next} style={{ padding: '10px 24px', background: '#0a0f1e', color: 'white', border: 'none', borderRadius: 10, fontFamily: "'Cairo',sans-serif", fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
              التالي ←
            </button>
          )}
          {step === STEPS.length - 1 && (
            <button onClick={createFirstWorkflow} disabled={loading} style={{ padding: '10px 24px', background: '#c8a96e', color: '#0a0f1e', border: 'none', borderRadius: 10, fontFamily: "'Cairo',sans-serif", fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
              {loading ? '...' : 'إنشاء سير العمل ⚡'}
            </button>
          )}
          {step === STEPS.length && (
            <button onClick={onComplete} style={{ padding: '10px 28px', background: '#1a6b4a', color: 'white', border: 'none', borderRadius: 10, fontFamily: "'Cairo',sans-serif", fontSize: 15, fontWeight: 800, cursor: 'pointer' }}>
              ادخل لوحة التحكم 🚀
            </button>
          )}
          {step < STEPS.length && step > 2 && (
            <button onClick={step === STEPS.length - 1 ? next : next} style={{ padding: '10px 14px', border: 'none', background: 'transparent', color: '#8a8f9a', fontFamily: "'Cairo',sans-serif", fontSize: 13, cursor: 'pointer' }}>
              تخطي
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;

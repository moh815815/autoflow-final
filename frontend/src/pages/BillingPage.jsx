// frontend/src/pages/BillingPage.jsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { billingAPI } from '../services/api';

const PLANS = [
  {
    id: 'starter', name: '🚀 ستارتر', price: 299,
    features: ['5 سير عمل نشطة', '500 عملية / شهر', '5 تكاملات', 'قوالب جاهزة', 'دعم بريد'],
  },
  {
    id: 'pro', name: '⚡ برو', price: 799, featured: true,
    features: ['20 سير عمل', '5,000 عملية / شهر', 'تكاملات غير محدودة', 'HR + مالية كاملة', 'تقارير + AI', 'إشعارات فورية', 'دعم واتساب'],
  },
  {
    id: 'enterprise', name: '🏢 إنتربرايز', price: null,
    features: ['سير عمل غير محدودة', 'عمليات غير محدودة', 'خادم مخصص', 'تخصيص كامل', 'تدريب + دعم مخصص'],
  },
];

export default function BillingPage() {
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status');
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('VISA');

  const { data, isLoading } = useQuery({
    queryKey: ['subscription'],
    queryFn: billingAPI.subscription,
  });

  const { data: invoicesData } = useQuery({
    queryKey: ['billing-invoices'],
    queryFn: billingAPI.invoices,
  });

  const subscribe = async (planId) => {
    if (planId === 'enterprise') { window.location.href = 'mailto:sales@autoflow.sa'; return; }
    setLoadingPlan(planId);
    try {
      const result = await billingAPI.checkout({ plan: planId, payment_brand: paymentMethod });
      // Load HyperPay widget script and redirect
      const script = document.createElement('script');
      script.src = result.script_url;
      script.async = true;
      document.head.appendChild(script);
      // Redirect to payment page
      window.location.href = `/payment?checkoutId=${result.checkoutId}&plan=${planId}`;
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingPlan(null);
    }
  };

  const sub = data?.subscription;
  const usagePercent = sub ? Math.round((sub.monthly_operations_used / sub.monthly_operations_limit) * 100) : 0;

  return (
    <div>
      {/* Status messages */}
      {status === 'success' && (
        <div style={{ background: '#e8f5ee', border: '1px solid #a7d7b8', borderRadius: 12, padding: '14px 18px', marginBottom: 20, color: '#1a6b4a', fontWeight: 700, fontSize: 14 }}>
          🎉 تم تفعيل اشتراكك بنجاح! شكراً لك.
        </div>
      )}
      {status === 'failed' && (
        <div style={{ background: '#fff0f0', border: '1px solid #fca5a5', borderRadius: 12, padding: '14px 18px', marginBottom: 20, color: '#8b1a1a', fontWeight: 700, fontSize: 14 }}>
          ❌ فشلت عملية الدفع. يرجى المحاولة مرة أخرى.
        </div>
      )}

      {/* Current Plan */}
      {sub && (
        <div style={{ background: '#fff', border: '1px solid #e8e4dc', borderRadius: 14, padding: '20px 22px', marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 14 }}>💎 اشتراكك الحالي</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
            <div>
              <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, marginBottom: 3 }}>الخطة</div>
              <div style={{ fontSize: 16, fontWeight: 900 }}>{sub.plan === 'pro' ? '⚡ Pro' : sub.plan === 'starter' ? '🚀 Starter' : '🏢 Enterprise'}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, marginBottom: 3 }}>تنتهي في</div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{sub.plan_expires_at ? new Date(sub.plan_expires_at).toLocaleDateString('ar-SA') : '—'}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, marginBottom: 3 }}>العمليات</div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{sub.monthly_operations_used?.toLocaleString()} / {sub.monthly_operations_limit?.toLocaleString()}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, marginBottom: 6 }}>الاستهلاك {usagePercent}%</div>
              <div style={{ height: 8, background: '#f0ece4', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: usagePercent > 80 ? '#e53e3e' : '#c8a96e', width: `${Math.min(usagePercent, 100)}%`, borderRadius: 4, transition: 'width .4s' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Method */}
      <div style={{ background: '#fff', border: '1px solid #e8e4dc', borderRadius: 14, padding: '16px 22px', marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>💳 طريقة الدفع</div>
        <div style={{ display: 'flex', gap: 10 }}>
          {[
            { id: 'VISA', label: 'Visa / Mastercard', icon: '💳' },
            { id: 'MADA', label: 'مدى', icon: '🏦' },
            { id: 'STC_PAY', label: 'STC Pay', icon: '📱' },
          ].map(m => (
            <div key={m.id} onClick={() => setPaymentMethod(m.id)}
              style={{ flex: 1, padding: '10px 14px', border: `2px solid ${paymentMethod === m.id ? '#c8a96e' : '#e8e4dc'}`, background: paymentMethod === m.id ? '#fdf8ef' : '#fff', borderRadius: 10, cursor: 'pointer', textAlign: 'center', transition: 'all .15s' }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{m.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 700 }}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Plans */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
        {PLANS.map(plan => (
          <div key={plan.id} style={{
            border: `2px solid ${plan.featured ? '#c8a96e' : '#e8e4dc'}`,
            borderRadius: 16, padding: '24px', position: 'relative',
            background: plan.featured ? 'linear-gradient(135deg,#fdf8ef,#fff)' : '#fff',
            boxShadow: plan.featured ? '0 4px 24px rgba(200,169,110,.15)' : 'none',
          }}>
            {plan.featured && (
              <div style={{ position: 'absolute', top: -12, right: '50%', transform: 'translateX(50%)', background: '#c8a96e', color: '#0a0f1e', fontSize: 10, fontWeight: 800, padding: '4px 14px', borderRadius: 10 }}>
                الأكثر شعبية
              </div>
            )}
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>{plan.name}</div>
            <div style={{ fontSize: 34, fontWeight: 900, marginBottom: 4 }}>{plan.price ? plan.price.toLocaleString() : 'تواصل'}</div>
            {plan.price && <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 18 }}>ريال / شهر</div>}
            <ul style={{ listStyle: 'none', marginBottom: 20 }}>
              {plan.features.map(f => (
                <li key={f} style={{ fontSize: 12, padding: '5px 0', borderBottom: '1px solid #f5f2eb', color: '#374151' }}>
                  <span style={{ color: '#1a6b4a', fontWeight: 700 }}>✓ </span>{f}
                </li>
              ))}
            </ul>
            <button onClick={() => subscribe(plan.id)}
              disabled={loadingPlan === plan.id || (sub?.plan === plan.id)}
              style={{
                width: '100%', padding: '11px', border: 'none', borderRadius: 10,
                fontFamily: "'Cairo',sans-serif", fontSize: 13, fontWeight: 800, cursor: 'pointer',
                background: plan.featured ? '#c8a96e' : sub?.plan === plan.id ? '#e8f5ee' : '#0a0f1e',
                color: plan.featured ? '#0a0f1e' : sub?.plan === plan.id ? '#1a6b4a' : '#fff',
                opacity: loadingPlan === plan.id ? .7 : 1,
                transition: 'all .2s',
              }}>
              {loadingPlan === plan.id ? '...' : sub?.plan === plan.id ? '✓ خطتك الحالية' : plan.price ? 'اشترك الآن' : 'تواصل معنا'}
            </button>
          </div>
        ))}
      </div>

      {/* Invoice History */}
      {invoicesData?.invoices?.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #e8e4dc', borderRadius: 14 }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #f0ece4', fontSize: 14, fontWeight: 800 }}>📄 سجل الدفعات</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#fafaf8' }}>
                {['التاريخ','الخطة','المبلغ','طريقة الدفع','الحالة'].map(h => (
                  <th key={h} style={{ textAlign: 'right', padding: '9px 16px', fontSize: 10, fontWeight: 700, color: '#9ca3af', borderBottom: '1px solid #f0ece4' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoicesData.invoices.map(inv => (
                <tr key={inv.id}>
                  <td style={{ padding: '11px 16px', fontSize: 12, borderBottom: '1px solid #fafaf8' }}>{new Date(inv.created_at).toLocaleDateString('ar-SA')}</td>
                  <td style={{ padding: '11px 16px', fontSize: 12, fontWeight: 700, borderBottom: '1px solid #fafaf8' }}>{inv.plan}</td>
                  <td style={{ padding: '11px 16px', fontSize: 12, fontWeight: 700, borderBottom: '1px solid #fafaf8' }}>{inv.amount} ر.س</td>
                  <td style={{ padding: '11px 16px', fontSize: 12, borderBottom: '1px solid #fafaf8' }}>{inv.payment_brand || '—'}</td>
                  <td style={{ padding: '11px 16px', borderBottom: '1px solid #fafaf8' }}>
                    <span style={{ background: inv.status === 'success' ? '#e8f5ee' : '#fff0f0', color: inv.status === 'success' ? '#1a6b4a' : '#8b1a1a', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6 }}>
                      {inv.status === 'success' ? '✓ مدفوع' : inv.status === 'pending' ? '⏳ معلق' : '✗ فشل'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

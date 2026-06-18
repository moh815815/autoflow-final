// frontend/src/pages/stubs.jsx
// Placeholder pages — كل صفحة تجلب بياناتها من الـ API
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  workflowsAPI, integrationsAPI, employeesAPI, attendanceAPI,
  payrollAPI, leaveAPI, ordersAPI, customersAPI, productsAPI,
  notificationsAPI, reportsAPI,
} from '../services/api';

// ===== Shared Components =====
const PageHeader = ({ title, sub, action, onAction }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
    <div>
      <div style={{ fontSize: 18, fontWeight: 900 }}>{title}</div>
      {sub && <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{sub}</div>}
    </div>
    {action && (
      <button onClick={onAction}
        style={{ padding: '8px 16px', background: '#0a0f1e', color: '#fff', border: 'none', borderRadius: 9, fontFamily: "'Cairo',sans-serif", fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
        {action}
      </button>
    )}
  </div>
);

const Card = ({ children, style }) => (
  <div style={{ background: '#fff', border: '1px solid #e8e4dc', borderRadius: 14, ...style }}>
    {children}
  </div>
);

const Badge = ({ label, type = 'info' }) => {
  const colors = {
    info: ['#e8eef8', '#1a3a6b'],
    success: ['#e8f5ee', '#1a6b4a'],
    error: ['#fff0f0', '#8b1a1a'],
    warning: ['#fff7e6', '#b7791f'],
    pending: ['#f0f0f0', '#6b7280'],
  };
  const [bg, color] = colors[type] || colors.info;
  return (
    <span style={{ background: bg, color, fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6 }}>
      {label}
    </span>
  );
};

// ===== WORKFLOWS PAGE =====
export const WorkflowsPage = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['workflows'], queryFn: () => workflowsAPI.list() });
  const toggleMutation = useMutation({
    mutationFn: workflowsAPI.toggle,
    onSuccess: () => { qc.invalidateQueries(['workflows']); toast.success('تم تحديث الحالة'); }
  });
  const runMutation = useMutation({
    mutationFn: (id) => workflowsAPI.run(id, {}),
    onSuccess: () => toast.success('تم تشغيل سير العمل'),
    onError: (e) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader title="⚡ سير العمل" sub="ابنِ وأدر سير عملك التلقائية" action="＋ سير عمل جديد" onAction={() => navigate('/workflows/new')} />
      <Card>
        {isLoading ? <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>جارٍ التحميل...</div> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#fafaf8' }}>
                {['الاسم','القسم','التشغيلات','معدل النجاح','الحالة','إجراءات'].map(h => (
                  <th key={h} style={{ textAlign: 'right', padding: '10px 16px', fontSize: 10, fontWeight: 700, color: '#9ca3af', borderBottom: '1px solid #f0ece4' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data?.workflows || []).map(wf => (
                <tr key={wf.id} style={{ cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fdf8ef'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, borderBottom: '1px solid #fafaf8' }}
                    onClick={() => navigate(`/workflows/${wf.id}/edit`)}>{wf.name}</td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #fafaf8' }}><Badge label={wf.category || '—'} /></td>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, borderBottom: '1px solid #fafaf8' }}>{wf.run_count?.toLocaleString()}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: '#1a6b4a', borderBottom: '1px solid #fafaf8' }}>
                    {wf.run_count > 0 ? `${Math.round((wf.success_count / wf.run_count) * 100)}%` : '—'}
                  </td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #fafaf8' }}>
                    <Badge label={wf.status === 'active' ? '✓ نشط' : wf.status === 'paused' ? '⏸ موقوف' : '📦 مسودة'} type={wf.status === 'active' ? 'success' : 'pending'} />
                  </td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid #fafaf8' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => runMutation.mutate(wf.id)}
                        style={{ padding: '5px 10px', border: '1px solid #e8e4dc', borderRadius: 7, background: '#fff', fontSize: 12, cursor: 'pointer' }}>▶ تشغيل</button>
                      <button onClick={() => toggleMutation.mutate(wf.id)}
                        style={{ padding: '5px 10px', border: '1px solid #e8e4dc', borderRadius: 7, background: '#fff', fontSize: 12, cursor: 'pointer' }}>
                        {wf.status === 'active' ? '⏸' : '▶'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!data?.workflows?.length && !isLoading && (
                <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: '#9ca3af' }}>
                  لا توجد سير عمل — <span style={{ color: '#1a3a6b', cursor: 'pointer', fontWeight: 700 }} onClick={() => navigate('/templates')}>ابدأ بقالب</span>
                </td></tr>
              )}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
};

// ===== TEMPLATES PAGE =====
export const TemplatesPage = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ['templates'], queryFn: workflowsAPI.templates });
  const useMutation2 = useMutation({
    mutationFn: (id) => workflowsAPI.useTemplate(id, {}),
    onSuccess: () => { qc.invalidateQueries(['workflows']); toast.success('تم إنشاء سير العمل'); navigate('/workflows'); }
  });

  return (
    <div>
      <PageHeader title="📋 القوالب الجاهزة" sub="ابدأ بسرعة مع قوالب مصممة للشركات العربية" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
        {(data?.templates || []).map(t => (
          <div key={t.id} style={{ background: '#fff', border: `2px solid ${t.is_featured ? '#c8a96e' : '#e8e4dc'}`, borderRadius: 14, padding: 18, cursor: 'pointer', transition: 'all .2s' }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{t.icon}</div>
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>{t.name_ar || t.name}</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 14, lineHeight: 1.6 }}>{t.description_ar || t.description}</div>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 14 }}>
              {(t.tags || []).map(tag => (
                <span key={tag} style={{ background: '#e8eef8', color: '#1a3a6b', fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 5 }}>{tag}</span>
              ))}
            </div>
            <button onClick={() => useMutation2.mutate(t.id)}
              style={{ width: '100%', padding: '8px', background: t.is_featured ? '#c8a96e' : '#0a0f1e', color: t.is_featured ? '#0a0f1e' : '#fff', border: 'none', borderRadius: 8, fontFamily: "'Cairo',sans-serif", fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              استخدم هذا القالب ←
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// ===== HR PAGE =====
export const HRPage = () => {
  const today = new Date().toISOString().split('T')[0];
  const { data: attData } = useQuery({ queryKey: ['attendance', today], queryFn: () => attendanceAPI.list({ date: today }) });
  const { data: leaveData } = useQuery({ queryKey: ['leave'], queryFn: () => leaveAPI.list({ status: 'pending' }) });
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader title="👥 الموارد البشرية" sub="حضور وانصراف وإجازات الموظفين" action="إدارة الموظفين" onAction={() => navigate('/payroll')} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        <Card>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #f0ece4', fontWeight: 800, fontSize: 14 }}>📅 الحضور — اليوم</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: '#fafaf8' }}>
              {['الموظف','الحضور','الانصراف','الحالة'].map(h => <th key={h} style={{ textAlign: 'right', padding: '8px 14px', fontSize: 10, fontWeight: 700, color: '#9ca3af', borderBottom: '1px solid #f0ece4' }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {(attData?.attendance || []).map(a => (
                <tr key={a.id}>
                  <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 700, borderBottom: '1px solid #fafaf8' }}>{a.employee_name}</td>
                  <td style={{ padding: '10px 14px', fontSize: 12, borderBottom: '1px solid #fafaf8' }}>{a.check_in ? new Date(a.check_in).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                  <td style={{ padding: '10px 14px', fontSize: 12, borderBottom: '1px solid #fafaf8' }}>{a.check_out ? new Date(a.check_out).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid #fafaf8' }}>
                    <Badge label={a.status === 'present' ? 'حاضر' : a.status === 'late' ? 'متأخر' : 'غائب'} type={a.status === 'present' ? 'success' : a.status === 'late' ? 'warning' : 'error'} />
                  </td>
                </tr>
              ))}
              {!attData?.attendance?.length && <tr><td colSpan={4} style={{ padding: 20, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>لا توجد بيانات لهذا اليوم</td></tr>}
            </tbody>
          </table>
        </Card>
        <Card>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #f0ece4', fontWeight: 800, fontSize: 14 }}>📝 طلبات الإجازات المعلقة</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: '#fafaf8' }}>
              {['الموظف','النوع','المدة','إجراء'].map(h => <th key={h} style={{ textAlign: 'right', padding: '8px 14px', fontSize: 10, fontWeight: 700, color: '#9ca3af', borderBottom: '1px solid #f0ece4' }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {(leaveData?.requests || []).map(l => (
                <tr key={l.id}>
                  <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 700, borderBottom: '1px solid #fafaf8' }}>{l.employee_name}</td>
                  <td style={{ padding: '10px 14px', fontSize: 12, borderBottom: '1px solid #fafaf8' }}>{l.type === 'annual' ? 'سنوية' : l.type === 'sick' ? 'مرضية' : l.type}</td>
                  <td style={{ padding: '10px 14px', fontSize: 12, borderBottom: '1px solid #fafaf8' }}>{l.days_count} يوم</td>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid #fafaf8' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => leaveAPI.approve(l.id).then(() => toast.success('تم الاعتماد'))}
                        style={{ padding: '4px 10px', background: '#e8f5ee', color: '#1a6b4a', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>✓ اعتماد</button>
                      <button onClick={() => leaveAPI.reject(l.id, { reason: 'مرفوض' }).then(() => toast('تم الرفض'))}
                        style={{ padding: '4px 10px', background: '#fff0f0', color: '#8b1a1a', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>✗ رفض</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!leaveData?.requests?.length && <tr><td colSpan={4} style={{ padding: 20, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>لا توجد طلبات معلقة</td></tr>}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
};

// ===== PAYROLL PAGE =====
export const PayrollPage = () => {
  const qc = useQueryClient();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const { useState } = require('react');

  const { data, isLoading } = useQuery({ queryKey: ['payroll', month, year], queryFn: () => payrollAPI.list({ month, year }) });
  const calcMutation = useMutation({ mutationFn: () => payrollAPI.calculate({ month, year }), onSuccess: (d) => { qc.invalidateQueries(['payroll']); toast.success(d.message); } });
  const distMutation = useMutation({ mutationFn: () => payrollAPI.distribute({ month, year, payment_reference: `PAY-${month}-${year}` }), onSuccess: (d) => { qc.invalidateQueries(['payroll']); toast.success(d.message); } });

  return (
    <div>
      <PageHeader title="💸 الرواتب" sub={`كشف الرواتب — ${month}/${year}`} />
      <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
        <button onClick={() => calcMutation.mutate()} disabled={calcMutation.isPending}
          style={{ padding: '8px 16px', background: '#1a3a6b', color: '#fff', border: 'none', borderRadius: 9, fontFamily: "'Cairo',sans-serif", fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          🔢 حساب الرواتب تلقائياً
        </button>
        <button onClick={() => distMutation.mutate()} disabled={distMutation.isPending}
          style={{ padding: '8px 16px', background: '#1a6b4a', color: '#fff', border: 'none', borderRadius: 9, fontFamily: "'Cairo',sans-serif", fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          💸 صرف وإشعار الموظفين
        </button>
      </div>
      <Card>
        {isLoading ? <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>جارٍ التحميل...</div> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: '#fafaf8' }}>
              {['الموظف','القسم','الأساسي','البدلات','الخصومات','الصافي','الحالة'].map(h => (
                <th key={h} style={{ textAlign: 'right', padding: '9px 14px', fontSize: 10, fontWeight: 700, color: '#9ca3af', borderBottom: '1px solid #f0ece4' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {(data?.payroll || []).map(p => (
                <tr key={p.id}>
                  <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 700, borderBottom: '1px solid #fafaf8' }}>{p.employee_name}</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, borderBottom: '1px solid #fafaf8' }}>{p.department}</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, borderBottom: '1px solid #fafaf8' }}>{Number(p.basic_salary).toLocaleString()}</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, borderBottom: '1px solid #fafaf8' }}>{(Number(p.housing_allowance) + Number(p.transport_allowance)).toLocaleString()}</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, color: '#8b1a1a', borderBottom: '1px solid #fafaf8' }}>-{Number(p.gosi_employee || 0).toLocaleString()}</td>
                  <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 900, borderBottom: '1px solid #fafaf8' }}>{Number(p.net_salary).toLocaleString()} ر.س</td>
                  <td style={{ padding: '11px 14px', borderBottom: '1px solid #fafaf8' }}>
                    <Badge label={p.status === 'paid' ? '✓ محوّل' : p.status === 'approved' ? 'معتمد' : 'مسودة'} type={p.status === 'paid' ? 'success' : p.status === 'approved' ? 'info' : 'pending'} />
                  </td>
                </tr>
              ))}
              {!data?.payroll?.length && <tr><td colSpan={7} style={{ padding: 24, textAlign: 'center', color: '#9ca3af' }}>اضغط "حساب الرواتب" لبدء الحساب</td></tr>}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
};

// ===== SIMPLE STUB PAGES =====
const SimplePage = ({ title, sub, icon }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13, color: '#9ca3af' }}>{sub}</div>
    </div>
  </div>
);

export const WorkflowEditorPage = () => <SimplePage icon="⚡" title="محرر سير العمل" sub="محرر مرئي متكامل — يُبنى قريباً مع React Flow" />;
export const IntegrationsPage = () => <SimplePage icon="🔗" title="التكاملات" sub="ربط أنظمتك الخارجية بأوتوفلو" />;
export const SalesPage = () => <SimplePage icon="🛒" title="المبيعات والشحن" sub="متصل بـ API الطلبات والشحن" />;
export const CRMPage = () => <SimplePage icon="🤝" title="العملاء / CRM" sub="إدارة خط مبيعاتك" />;
export const InventoryPage = () => <SimplePage icon="📦" title="المخزون" sub="تتبع المنتجات والكميات" />;
export const LogsPage = () => <SimplePage icon="📝" title="سجل التشغيل" sub="كل العمليات والأخطاء" />;
export const ReportsPage = () => <SimplePage icon="📈" title="التقارير" sub="تحليلات الأداء والإحصائيات" />;
export const NotificationsPage = () => <SimplePage icon="🔔" title="الإشعارات" sub="كل التنبيهات في مكان واحد" />;
export const TeamPage = () => <SimplePage icon="🏢" title="الفريق" sub="إدارة الأعضاء والصلاحيات" />;
export const AIPage = () => <SimplePage icon="🤖" title="مساعد AI" sub="اسأل عن شركتك بالعربي" />;
export const SettingsPage = () => <SimplePage icon="⚙️" title="الإعدادات" sub="إعدادات الحساب والمنصة" />;

// frontend/src/pages/DashboardPage.jsx
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { reportsAPI, workflowsAPI, notificationsAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const StatCard = ({ label, value, sub, change, color, icon }) => (
  <div style={{
    background: '#fff', border: '1px solid #e8e4dc', borderRadius: 14,
    padding: '18px 20px', position: 'relative', overflow: 'hidden',
    transition: 'all .2s', cursor: 'default',
    borderRight: `4px solid ${color}`,
  }}>
    <div style={{ position: 'absolute', top: 14, left: 16, fontSize: 26, opacity: .1 }}>{icon}</div>
    <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 6 }}>{label}</div>
    <div style={{ fontSize: 28, fontWeight: 900, lineHeight: 1 }}>{value ?? '—'}</div>
    {sub && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 5 }}>{sub}</div>}
    {change && <div style={{ fontSize: 11, fontWeight: 700, color: '#1a6b4a', marginTop: 4 }}>{change}</div>}
  </div>
);

const Dot = ({ color }) => (
  <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block', marginLeft: 6 }} />
);

export default function DashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: reportsAPI.dashboard,
    refetchInterval: 30000,
  });

  const { data: chartData } = useQuery({
    queryKey: ['runs-chart'],
    queryFn: reportsAPI.runsChart,
  });

  const { data: topWfs } = useQuery({
    queryKey: ['top-workflows'],
    queryFn: reportsAPI.topWorkflows,
  });

  const { data: notifsData } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsAPI.list,
  });

  if (isLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div style={{ textAlign: 'center', color: '#9ca3af' }}>
        <div style={{ fontSize: 32, marginBottom: 10, animation: 'spin 1s linear infinite' }}>⚡</div>
        <div style={{ fontSize: 13, fontWeight: 600 }}>جارٍ التحميل...</div>
      </div>
    </div>
  );

  const s = stats || {};

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg,#0a0f1e 0%,#1a2d5a 100%)',
        borderRadius: 16, padding: '22px 26px', color: '#fff', marginBottom: 22,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', fontSize: 64, opacity: .05 }}>⚡</div>
        <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 3 }}>مرحباً، {user?.name?.split(' ')[0]}! 👋</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,.6)' }}>
          {s.workflows?.active} سير عمل نشط · {s.runs?.total?.toLocaleString()} عملية هذا الشهر
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          <button onClick={() => navigate('/workflows')}
            style={{ padding: '7px 16px', background: '#c8a96e', color: '#0a0f1e', border: 'none', borderRadius: 8, fontFamily: "'Cairo',sans-serif", fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            ⚡ إدارة سير العمل
          </button>
          <button onClick={() => navigate('/templates')}
            style={{ padding: '7px 16px', background: 'rgba(255,255,255,.1)', color: '#fff', border: '1px solid rgba(255,255,255,.2)', borderRadius: 8, fontFamily: "'Cairo',sans-serif", fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            📋 قوالب جاهزة
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 22 }}>
        <StatCard label="سير العمل النشطة" value={s.workflows?.active} sub={`من ${s.workflows?.total} إجمالي`} color="#c8a96e" icon="⚡" />
        <StatCard label="العمليات المنفذة" value={s.runs?.total?.toLocaleString()} sub="هذا الشهر" change={`↑ ${s.runs?.time_saved_hours} ساعة موفّرة`} color="#2756a8" icon="▶" />
        <StatCard label="معدل النجاح" value={`${s.runs?.success_rate}%`} sub={`${s.runs?.errors} خطأ`} color="#1a6b4a" icon="✓" />
        <StatCard label="الموظفون" value={s.employees?.active} sub={`من ${s.employees?.total} إجمالي`} color="#805ad5" icon="👥" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 18, marginBottom: 18 }}>
        {/* Chart */}
        <div style={{ background: '#fff', border: '1px solid #e8e4dc', borderRadius: 14 }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #f0ece4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, fontWeight: 800 }}>📊 العمليات اليومية</span>
            <div style={{ fontSize: 11, display: 'flex', gap: 12 }}>
              <span><Dot color="#2756a8" /> ناجحة</span>
              <span><Dot color="#e53e3e" /> أخطاء</span>
            </div>
          </div>
          <div style={{ padding: '16px 8px' }}>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={chartData?.chart || []} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" tick={{ fontSize: 9, fontFamily: 'Cairo' }} tickFormatter={d => d?.slice(8)} />
                <YAxis tick={{ fontSize: 9 }} />
                <Tooltip
                  contentStyle={{ fontFamily: 'Cairo', fontSize: 12, borderRadius: 8, border: '1px solid #e8e4dc' }}
                  formatter={(v, n) => [v, n === 'success' ? 'ناجحة' : 'أخطاء']}
                />
                <Bar dataKey="success" fill="#2756a8" radius={[3, 3, 0, 0]} maxBarSize={20} />
                <Bar dataKey="errors" fill="#e53e3e" radius={[3, 3, 0, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Notifications */}
        <div style={{ background: '#fff', border: '1px solid #e8e4dc', borderRadius: 14 }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #f0ece4', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14, fontWeight: 800 }}>🔔 آخر الإشعارات</span>
            <span style={{ fontSize: 12, color: '#1a3a6b', cursor: 'pointer', fontWeight: 600 }} onClick={() => navigate('/notifications')}>عرض الكل</span>
          </div>
          <div style={{ padding: '8px 0' }}>
            {(notifsData?.notifications || []).slice(0, 5).map(n => (
              <div key={n.id} style={{ display: 'flex', gap: 10, padding: '9px 16px', borderBottom: '1px solid #fafaf8', background: n.status === 'unread' ? '#fdf8ef' : '#fff' }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: n.status === 'unread' ? '#c8a96e' : '#e8e4dc', marginTop: 5, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{n.title}</div>
                  <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 1 }}>{n.message?.substring(0, 55)}</div>
                </div>
              </div>
            ))}
            {!notifsData?.notifications?.length && (
              <div style={{ padding: 20, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>لا توجد إشعارات جديدة</div>
            )}
          </div>
        </div>
      </div>

      {/* Top Workflows */}
      <div style={{ background: '#fff', border: '1px solid #e8e4dc', borderRadius: 14 }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #f0ece4', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 14, fontWeight: 800 }}>⚡ أكثر سير العمل استخداماً</span>
          <span style={{ fontSize: 12, color: '#1a3a6b', cursor: 'pointer', fontWeight: 600 }} onClick={() => navigate('/workflows')}>إدارة الكل</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#fafaf8' }}>
                {['سير العمل', 'القسم', 'عمليات', 'نجاح', 'الحالة', ''].map(h => (
                  <th key={h} style={{ textAlign: 'right', padding: '9px 16px', fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: .5, borderBottom: '1px solid #f0ece4' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(topWfs?.workflows || []).map(wf => (
                <tr key={wf.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/workflows/${wf.id}/edit`)}
                  onMouseEnter={e => e.currentTarget.style.background = '#fdf8ef'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                  <td style={{ padding: '11px 16px', fontSize: 13, fontWeight: 700, borderBottom: '1px solid #fafaf8' }}>{wf.name}</td>
                  <td style={{ padding: '11px 16px', fontSize: 12, borderBottom: '1px solid #fafaf8' }}>
                    <span style={{ background: '#e8eef8', color: '#1a3a6b', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 5 }}>{wf.category || '—'}</span>
                  </td>
                  <td style={{ padding: '11px 16px', fontSize: 13, fontWeight: 700, borderBottom: '1px solid #fafaf8' }}>{wf.run_count?.toLocaleString()}</td>
                  <td style={{ padding: '11px 16px', fontSize: 12, borderBottom: '1px solid #fafaf8' }}>
                    <span style={{ color: '#1a6b4a', fontWeight: 700 }}>
                      {wf.run_count > 0 ? `${Math.round((wf.success_count / wf.run_count) * 100)}%` : '—'}
                    </span>
                  </td>
                  <td style={{ padding: '11px 16px', borderBottom: '1px solid #fafaf8' }}>
                    <span style={{ background: '#e8f5ee', color: '#1a6b4a', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6 }}>✓ نشط</span>
                  </td>
                  <td style={{ padding: '11px 16px', fontSize: 13, borderBottom: '1px solid #fafaf8' }}>→</td>
                </tr>
              ))}
              {!topWfs?.workflows?.length && (
                <tr><td colSpan={6} style={{ padding: 24, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
                  لا توجد سير عمل بعد — <span style={{ color: '#1a3a6b', cursor: 'pointer', fontWeight: 700 }} onClick={() => navigate('/templates')}>ابدأ بقالب جاهز</span>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

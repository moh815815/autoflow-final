// frontend/src/components/Layout.jsx
import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import useSocket from '../hooks/useSocket';
import { reportsAPI, notificationsAPI } from '../services/api';

const NAV = [
  { section: 'الرئيسية' },
  { to: '/dashboard',     icon: '📊', label: 'لوحة التحكم' },
  { to: '/workflows',     icon: '⚡', label: 'سير العمل',      badge: 'workflows' },
  { to: '/templates',     icon: '📋', label: 'القوالب' },
  { section: 'المؤسسة' },
  { to: '/hr',            icon: '👥', label: 'الموارد البشرية' },
  { to: '/payroll',       icon: '💸', label: 'الرواتب' },
  { to: '/sales',         icon: '🛒', label: 'المبيعات والشحن' },
  { to: '/crm',           icon: '🤝', label: 'العملاء / CRM' },
  { to: '/inventory',     icon: '📦', label: 'المخزون' },
  { section: 'التحليلات' },
  { to: '/reports',       icon: '📈', label: 'التقارير' },
  { to: '/integrations',  icon: '🔗', label: 'التكاملات' },
  { to: '/logs',          icon: '📝', label: 'سجل التشغيل', badge: 'errors' },
  { to: '/notifications', icon: '🔔', label: 'الإشعارات',    badge: 'notifs' },
  { to: '/team',          icon: '🏢', label: 'الفريق' },
  { to: '/ai',            icon: '🤖', label: 'مساعد AI',      badgeLabel: 'جديد', badgeColor: '#c8a96e' },
  { section: 'الحساب' },
  { to: '/billing',       icon: '💎', label: 'الاشتراك' },
  { to: '/settings',      icon: '⚙️', label: 'الإعدادات' },
];

export default function Layout() {
  const { user, logout } = useAuthStore();
  const { unreadCount, lastNotification, connected } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [notifPanelOpen, setNotifPanelOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');

  // Fetch dashboard stats for badges
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: reportsAPI.dashboard,
    refetchInterval: 60000,
  });

  // Notifications
  const { data: notifsData } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsAPI.list,
    refetchInterval: 30000,
  });

  // Toast on new real-time notification
  useEffect(() => {
    if (lastNotification) {
      toast(lastNotification.title, {
        icon: lastNotification.type === 'workflow_error' ? '❌' : '🔔',
      });
    }
  }, [lastNotification]);

  // Dark mode
  useEffect(() => {
    document.body.classList.toggle('dark', dark);
  }, [dark]);

  // Keyboard shortcut Ctrl+K
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') { setSearchOpen(false); setNotifPanelOpen(false); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const getBadge = (badgeKey) => {
    if (badgeKey === 'notifs') return unreadCount > 0 ? unreadCount : null;
    if (badgeKey === 'errors') return stats?.runs?.errors > 0 ? stats.runs.errors : null;
    if (badgeKey === 'workflows') return stats?.workflows?.active > 0 ? stats.workflows.active : null;
    return null;
  };

  const pageTitle = NAV.find(n => n.to === location.pathname)?.label || 'أوتوفلو';

  const searchItems = NAV.filter(n => n.to).filter(n =>
    !searchQ || n.label.includes(searchQ)
  );

  const usagePercent = user
    ? Math.round((user.monthly_operations_used / user.monthly_operations_limit) * 100)
    : 0;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--paper, #f5f2eb)', direction: 'rtl', fontFamily: "'Cairo', sans-serif" }}>

      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 99 }} />
      )}

      {/* ===== SIDEBAR ===== */}
      <aside style={{
        width: 256, background: '#0a0f1e', color: 'white',
        position: 'fixed', top: 0, right: 0, height: '100vh',
        display: 'flex', flexDirection: 'column', zIndex: 100, overflowY: 'auto',
        transform: sidebarOpen ? 'none' : undefined,
        transition: 'transform .3s',
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid rgba(200,169,110,.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#c8a96e,#a07840)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>⚡</div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 17 }}>أوتوفلو</div>
              <div style={{ fontSize: 9, color: '#c8a96e', letterSpacing: 1 }}>AUTOFLOW PRO</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '8px 0' }}>
          {NAV.map((item, i) => {
            if (item.section) return (
              <div key={i} style={{ padding: '14px 18px 4px', fontSize: 9, textTransform: 'uppercase', letterSpacing: 1.5, color: 'rgba(200,169,110,.5)', fontWeight: 700 }}>
                {item.section}
              </div>
            );
            const badge = item.badge ? getBadge(item.badge) : null;
            return (
              <NavLink key={item.to} to={item.to}
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: 11,
                  padding: '9px 14px', margin: '1px 8px', borderRadius: 8,
                  fontSize: 13, fontWeight: 500, textDecoration: 'none',
                  color: isActive ? '#e8d4a8' : 'rgba(255,255,255,.65)',
                  background: isActive ? 'rgba(200,169,110,.12)' : 'transparent',
                  borderRight: isActive ? '3px solid #c8a96e' : '3px solid transparent',
                  transition: 'all .15s',
                })}
              >
                <span style={{ fontSize: 15, width: 20, textAlign: 'center' }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {badge && (
                  <span style={{ background: badge === 'جديد' ? '#c8a96e' : '#e53e3e', color: badge === 'جديد' ? '#0a0f1e' : 'white', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 8, minWidth: 18, textAlign: 'center' }}>
                    {badge}
                  </span>
                )}
                {item.badgeLabel && (
                  <span style={{ background: item.badgeColor || '#c8a96e', color: '#0a0f1e', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 8 }}>
                    {item.badgeLabel}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Usage bar */}
        {user && (
          <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,.4)', marginBottom: 5 }}>
              <span>استهلاك العمليات</span>
              <span>{user.monthly_operations_used?.toLocaleString()} / {user.monthly_operations_limit?.toLocaleString()}</span>
            </div>
            <div style={{ height: 4, background: 'rgba(255,255,255,.1)', borderRadius: 2 }}>
              <div style={{ height: '100%', background: usagePercent > 80 ? '#e53e3e' : '#c8a96e', borderRadius: 2, width: `${Math.min(usagePercent, 100)}%`, transition: 'width .4s' }} />
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', fontWeight: 600 }}>الوضع الليلي</span>
            <div onClick={() => setDark(d => !d)}
              style={{ width: 40, height: 22, background: dark ? '#1a6b4a' : 'rgba(255,255,255,.15)', borderRadius: 11, position: 'relative', cursor: 'pointer', transition: 'background .3s' }}>
              <div style={{ width: 16, height: 16, background: 'white', borderRadius: '50%', position: 'absolute', top: 3, left: dark ? 3 : 21, transition: 'left .3s', boxShadow: '0 1px 4px rgba(0,0,0,.2)' }} />
            </div>
          </div>
          <div onClick={() => navigate('/settings')}
            style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 10px', background: 'rgba(255,255,255,.05)', borderRadius: 9, cursor: 'pointer' }}>
            <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#1a3a6b,#2756a8)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>
              {user?.name?.charAt(0)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.3 }}>{user?.name}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)' }}>{user?.plan === 'pro' ? '⚡ Pro' : user?.plan}</div>
            </div>
            <span style={{ fontSize: 12, opacity: .4, cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); logout(); }}>خروج</span>
          </div>
        </div>
      </aside>

      {/* ===== MAIN ===== */}
      <main style={{ marginRight: 256, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        {/* Top Bar */}
        <div style={{
          background: '#fff', borderBottom: '1px solid #e8e4dc',
          padding: '0 28px', height: 62,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 50,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => setSidebarOpen(s => !s)}
              style={{ display: 'none', width: 34, height: 34, border: '1px solid #e8e4dc', borderRadius: 8, background: '#fff', fontSize: 16, cursor: 'pointer' }}
              className="mobile-menu">☰</button>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800 }}>{pageTitle}</div>
              <div style={{ fontSize: 11, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: connected ? '#1a6b4a' : '#e53e3e', display: 'inline-block' }} />
                {connected ? 'متصل' : 'غير متصل'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Search */}
            <button onClick={() => setSearchOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', border: '1px solid #e8e4dc', borderRadius: 8, background: '#fafaf8', fontSize: 12, color: '#9ca3af', cursor: 'pointer', fontFamily: "'Cairo', sans-serif" }}>
              🔍 بحث سريع... <span style={{ background: '#f0ece4', padding: '1px 5px', borderRadius: 4, fontSize: 10, fontWeight: 700 }}>⌘K</span>
            </button>

            {/* Notifications */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => setNotifPanelOpen(o => !o)}
                style={{ width: 34, height: 34, border: '1px solid #e8e4dc', borderRadius: 8, background: '#fff', fontSize: 15, cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                🔔
                {unreadCount > 0 && (
                  <span style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, background: '#e53e3e', borderRadius: '50%', border: '1.5px solid #fff' }} />
                )}
              </button>

              {/* Notif dropdown */}
              {notifPanelOpen && (
                <div style={{
                  position: 'absolute', top: 42, left: 0, width: 340,
                  background: '#fff', border: '1px solid #e8e4dc', borderRadius: 14,
                  boxShadow: '0 8px 32px rgba(0,0,0,.12)', zIndex: 200,
                }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0ece4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, fontSize: 14 }}>الإشعارات</span>
                    <span style={{ fontSize: 11, color: '#1a3a6b', cursor: 'pointer', fontWeight: 600 }}
                      onClick={() => { notificationsAPI.readAll(); setNotifPanelOpen(false); }}>
                      تحديد كمقروء
                    </span>
                  </div>
                  {(notifsData?.notifications || []).slice(0, 5).map(n => (
                    <div key={n.id} style={{ padding: '11px 16px', borderBottom: '1px solid #f8f5f0', background: n.status === 'unread' ? '#fdf8ef' : '#fff', display: 'flex', gap: 10 }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: n.status === 'unread' ? '#c8a96e' : 'transparent', border: n.status !== 'unread' ? '1px solid #e8e4dc' : 'none', marginTop: 5, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700 }}>{n.title}</div>
                        <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>{n.message?.substring(0, 60)}</div>
                      </div>
                    </div>
                  ))}
                  <div style={{ padding: '10px 16px', textAlign: 'center' }}>
                    <span style={{ fontSize: 12, color: '#1a3a6b', cursor: 'pointer', fontWeight: 600 }}
                      onClick={() => { navigate('/notifications'); setNotifPanelOpen(false); }}>
                      عرض الكل
                    </span>
                  </div>
                </div>
              )}
            </div>

            <button onClick={() => navigate('/workflows/new')}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#0a0f1e', color: '#fff', border: 'none', borderRadius: 8, fontFamily: "'Cairo', sans-serif", fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              ＋ سير عمل
            </button>
          </div>
        </div>

        {/* Page content */}
        <div style={{ padding: '24px 28px', flex: 1 }}>
          <Outlet />
        </div>
      </main>

      {/* ===== SEARCH MODAL ===== */}
      {searchOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,15,30,.7)', backdropFilter: 'blur(4px)', zIndex: 300, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 80 }}
          onClick={(e) => e.target === e.currentTarget && setSearchOpen(false)}>
          <div style={{ background: '#fff', borderRadius: 16, width: 560, maxWidth: '92vw', boxShadow: '0 16px 48px rgba(0,0,0,.2)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', borderBottom: '1px solid #f0ece4' }}>
              <span style={{ fontSize: 16 }}>🔍</span>
              <input autoFocus value={searchQ} onChange={e => setSearchQ(e.target.value)}
                placeholder="ابحث عن أي صفحة أو ميزة..."
                style={{ flex: 1, border: 'none', outline: 'none', fontFamily: "'Cairo', sans-serif", fontSize: 14 }} />
              <span style={{ fontSize: 11, color: '#9ca3af', cursor: 'pointer' }} onClick={() => setSearchOpen(false)}>Esc</span>
            </div>
            <div style={{ maxHeight: 320, overflowY: 'auto' }}>
              {searchItems.map(item => (
                <div key={item.to}
                  onClick={() => { navigate(item.to); setSearchOpen(false); setSearchQ(''); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 18px', cursor: 'pointer', transition: 'background .1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fdf8ef'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                  <div style={{ width: 34, height: 34, background: '#f5f2eb', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{item.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{item.label}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: '8px 18px', borderTop: '1px solid #f0ece4', display: 'flex', gap: 14, fontSize: 11, color: '#9ca3af' }}>
              <span>↑↓ تنقل</span><span>Enter فتح</span><span>Esc إغلاق</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

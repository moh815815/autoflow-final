# ⚡ أوتوفلو — منصة الأتمتة للشركات العربية

منصة SaaS عربية كاملة لأتمتة عمليات الشركات.

---

## 🏗️ هيكل المشروع الكامل

```
autoflow/
├── backend/                    # Node.js + Express
│   ├── src/
│   │   ├── server.js           # الخادم الرئيسي + Socket.IO
│   │   ├── config/database.js  # PostgreSQL
│   │   ├── middleware/auth.js  # JWT + صلاحيات + حصة
│   │   ├── routes/             # 17 مسار API
│   │   │   ├── auth.js         # تسجيل / دخول
│   │   │   ├── workflows.js    # سير العمل
│   │   │   ├── billing.js      # HyperPay
│   │   │   ├── webhooks.js     # Salla/Zid/بصمة
│   │   │   └── ...
│   │   ├── services/
│   │   │   ├── workflowEngine.js   # ⚡ محرك الأتمتة
│   │   │   ├── socketService.js    # WebSockets
│   │   │   ├── integrationService.js # Aramex/ZATCA
│   │   │   ├── notificationService.js
│   │   │   └── uploadService.js
│   │   ├── jobs/scheduler.js   # Cron jobs
│   │   └── utils/
│   │       ├── schema.sql      # 13 جدول PostgreSQL
│   │       ├── billing_migration.sql
│   │       └── seed.sql        # بيانات تجريبية
│   ├── tests/auth.test.js      # اختبارات Jest
│   ├── Dockerfile
│   ├── package.json
│   └── jest.config.json
│
├── frontend/                   # React + Vite
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx             # Router كامل
│   │   ├── components/
│   │   │   ├── Layout.jsx      # Sidebar + TopBar
│   │   │   └── Onboarding.jsx  # Wizard إعداد جديد
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── BillingPage.jsx
│   │   │   └── stubs.jsx       # باقي الصفحات
│   │   ├── services/api.js     # Axios + كل endpoints
│   │   ├── store/authStore.js  # Zustand auth
│   │   └── hooks/useSocket.js  # Socket.IO hook
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── Dockerfile
│
├── landing/index.html          # صفحة تسويقية كاملة
├── docker-compose.yml          # Full stack
├── nginx.conf                  # Reverse proxy + SSL
├── .env.example                # متغيرات البيئة
├── .github/workflows/deploy.yml # CI/CD
└── scripts/
    ├── setup.sh                # إعداد السيرفر أول مرة
    └── deploy.sh               # نشر تحديثات
```

---

## 🚀 تشغيل المشروع محلياً

### المتطلبات
- Node.js 18+
- PostgreSQL 15+
- Redis 7+

### 1. إعداد قاعدة البيانات
```bash
createdb autoflow
psql autoflow < backend/src/utils/schema.sql
psql autoflow < backend/src/utils/billing_migration.sql
psql autoflow < backend/src/utils/seed.sql
```

### 2. Backend
```bash
cd backend
cp .env.example .env
# عدّل .env بإضافة DB_PASSWORD و JWT_SECRET
npm install
npm run dev
# يعمل على http://localhost:3000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
# يعمل على http://localhost:5173
```

### 4. تسجيل الدخول التجريبي
| الدور | البريد | كلمة المرور |
|-------|--------|------------|
| مدير | admin@alamal.sa | Demo@1234 |
| HR | sara@alamal.sa | Demo@1234 |
| محاسب | fahad@alamal.sa | Demo@1234 |

---

## 🐳 تشغيل بـ Docker

```bash
cp .env.example .env
# عدّل .env

docker-compose up -d
# يشغّل: Backend + Frontend + PostgreSQL + Redis + Nginx
```

---

## 🌐 النشر على السيرفر

```bash
# أول مرة فقط
bash scripts/setup.sh

# تحديثات لاحقة
bash scripts/deploy.sh
```

---

## 🔌 API Reference

### Auth
```
POST /api/auth/register   — إنشاء حساب
POST /api/auth/login      — تسجيل الدخول
GET  /api/auth/me         — بيانات المستخدم
```

### Workflows
```
GET    /api/workflows           — قائمة
POST   /api/workflows           — إنشاء
PUT    /api/workflows/:id       — تحديث
POST   /api/workflows/:id/run   — تشغيل
PATCH  /api/workflows/:id/toggle — تفعيل/إيقاف
GET    /api/workflows/:id/runs  — سجل تشغيل
```

### Webhooks (لاستقبال أحداث خارجية)
```
POST /api/webhooks/:slug/:key     — تشغيل سير عمل
POST /api/webhooks/orders/:slug   — طلبات Salla/Zid
POST /api/webhooks/attendance/:slug — بيانات البصمة
```

### Billing (HyperPay)
```
GET  /api/billing/subscription — الاشتراك الحالي
POST /api/billing/checkout     — بدء الدفع
GET  /api/billing/result       — نتيجة الدفع (redirect)
```

---

## ⚡ محرك سير العمل — أنواع العقد

| النوع | الوصف |
|-------|-------|
| `trigger` | بداية سير العمل |
| `http_request` | استدعاء API خارجي |
| `integration_call` | أرامكس/زاتكا/ERP |
| `condition` | شرط if/else |
| `send_whatsapp` | إرسال واتساب |
| `send_email` | إرسال بريد |
| `send_sms` | إرسال SMS |
| `delay` | تأخير |
| `set_variable` | تعيين متغير |
| `update_record` | تحديث DB |
| `create_record` | إنشاء سجل |
| `loop` | تكرار |
| `code` | JavaScript |

### مثال: متغيرات ديناميكية
```json
{
  "type": "send_whatsapp",
  "config": {
    "to": "{{customer.phone}}",
    "message": "مرحباً {{customer.name}}، طلبك {{order.number}} تم شحنه 📦"
  }
}
```

---

## 💎 خطط الاشتراك

| | Starter | Pro | Enterprise |
|---|---|---|---|
| السعر | 299 ر.س | 799 ر.س | تواصل |
| العمليات/شهر | 500 | 5,000 | غير محدود |
| سير العمل | 5 | 20 | غير محدود |
| التكاملات | 5 | غير محدود | غير محدود |
| WebSockets | ✗ | ✓ | ✓ |
| AI Assistant | ✗ | ✓ | ✓ |

---

## 🛡️ الأمان

- **Multi-tenancy**: كل شركة معزولة بـ `tenant_id`
- **تشفير Credentials**: AES-256-CBC
- **JWT**: انتهاء صلاحية 7 أيام
- **Rate Limiting**: 300 طلب / 15 دقيقة
- **Helmet**: حماية HTTP headers
- **SQL Injection**: Parameterized queries فقط
- **File Upload**: فلترة نوع الملف + حد الحجم

---

## 🗺️ الخطوات التالية

- [ ] محرر سير العمل المرئي (React Flow)
- [ ] دعم Stripe للأسواق الغربية
- [ ] تطبيق موبايل (React Native)
- [ ] AI لاقتراح سير العمل تلقائياً
- [ ] تقارير قابلة للتصدير PDF
- [ ] API عام للمطورين

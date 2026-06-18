// backend/tests/auth.test.js
const request = require('supertest');
const { app } = require('../src/server');
const db = require('../src/config/database');

let token;
let tenantId;

beforeAll(async () => {
  // Clean test data
  await db.query("DELETE FROM users WHERE email LIKE '%@test.autoflow'");
  await db.query("DELETE FROM tenants WHERE email LIKE '%@test.autoflow'");
});

afterAll(async () => {
  await db.pool.end();
});

describe('🔐 Authentication', () => {

  test('POST /api/auth/register — تسجيل شركة جديدة', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        company_name: 'شركة الاختبار',
        name: 'مستخدم الاختبار',
        email: 'admin@test.autoflow',
        password: 'Test@1234',
        phone: '+966500000000',
      });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('admin@test.autoflow');
    token = res.body.token;
    tenantId = res.body.user.tenant_id;
  });

  test('POST /api/auth/register — رفض البريد المكرر', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        company_name: 'شركة أخرى',
        name: 'مستخدم آخر',
        email: 'admin@test.autoflow',
        password: 'Test@1234',
      });
    expect(res.status).toBe(409);
  });

  test('POST /api/auth/login — تسجيل الدخول', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.autoflow', password: 'Test@1234' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('owner');
  });

  test('POST /api/auth/login — رفض كلمة المرور الخاطئة', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.autoflow', password: 'wrong' });
    expect(res.status).toBe(401);
  });

  test('GET /api/auth/me — جلب بيانات المستخدم', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('admin@test.autoflow');
  });

  test('GET /api/auth/me — رفض بدون token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});

describe('⚡ Workflows', () => {

  let workflowId;

  test('POST /api/workflows — إنشاء سير عمل', async () => {
    const res = await request(app)
      .post('/api/workflows')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'سير عمل اختبار',
        category: 'sales',
        trigger_type: 'manual',
        nodes: [{ id: 'n1', type: 'trigger', name: 'بداية' }],
        edges: [],
      });

    expect(res.status).toBe(201);
    expect(res.body.workflow.name).toBe('سير عمل اختبار');
    workflowId = res.body.workflow.id;
  });

  test('GET /api/workflows — قائمة سير العمل', async () => {
    const res = await request(app)
      .get('/api/workflows')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.workflows).toBeInstanceOf(Array);
    expect(res.body.workflows.length).toBeGreaterThan(0);
  });

  test('GET /api/workflows/:id — سير عمل واحد', async () => {
    const res = await request(app)
      .get(`/api/workflows/${workflowId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.workflow.id).toBe(workflowId);
  });

  test('PUT /api/workflows/:id — تحديث سير العمل', async () => {
    const res = await request(app)
      .put(`/api/workflows/${workflowId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'سير عمل محدّث', status: 'active', trigger_type: 'manual', nodes: [], edges: [] });

    expect(res.status).toBe(200);
    expect(res.body.workflow.name).toBe('سير عمل محدّث');
  });

  test('PATCH /api/workflows/:id/toggle — تغيير الحالة', async () => {
    const res = await request(app)
      .patch(`/api/workflows/${workflowId}/toggle`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(['active', 'paused']).toContain(res.body.status);
  });

  test('GET /api/workflows/:id/runs — سجل التشغيل', async () => {
    const res = await request(app)
      .get(`/api/workflows/${workflowId}/runs`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.runs).toBeInstanceOf(Array);
  });
});

describe('👥 Employees', () => {

  let employeeId;

  test('POST /api/employees — إضافة موظف', async () => {
    const res = await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'موظف الاختبار',
        email: 'emp@test.autoflow',
        department: 'تقنية',
        position: 'مطور',
        basic_salary: 8000,
        hire_date: '2024-01-01',
      });

    expect(res.status).toBe(201);
    expect(res.body.employee.name).toBe('موظف الاختبار');
    employeeId = res.body.employee.id;
  });

  test('GET /api/employees — قائمة الموظفين', async () => {
    const res = await request(app)
      .get('/api/employees')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.employees.length).toBeGreaterThan(0);
  });
});

describe('📊 Reports', () => {

  test('GET /api/reports/dashboard — إحصائيات لوحة التحكم', async () => {
    const res = await request(app)
      .get('/api/reports/dashboard')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.workflows).toBeDefined();
    expect(res.body.runs).toBeDefined();
  });
});

describe('🌐 Webhooks', () => {

  test('GET /health — فحص حالة الخادم', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

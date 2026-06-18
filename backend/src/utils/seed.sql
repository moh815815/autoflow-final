-- ============================================
-- Seed Data — بيانات تجريبية
-- ============================================

-- Demo Tenant
INSERT INTO tenants (id, name, slug, email, phone, country, city, plan, plan_expires_at, monthly_operations_limit)
VALUES (
  'aaaaaaaa-0000-0000-0000-000000000001',
  'شركة الأمل للتجارة',
  'alamal-trading',
  'demo@alamal.sa',
  '+966501234567',
  'SA', 'الرياض',
  'pro',
  NOW() + INTERVAL '1 year',
  5000
) ON CONFLICT DO NOTHING;

-- Demo Users
INSERT INTO users (id, tenant_id, name, email, password_hash, role, email_verified_at)
VALUES
  ('bbbbbbbb-0000-0000-0000-000000000001',
   'aaaaaaaa-0000-0000-0000-000000000001',
   'أحمد الشمري', 'admin@alamal.sa',
   '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQyCgCf4c3wJWr7J0vMf1nZKi', -- password: Demo@1234
   'owner', NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000002',
   'aaaaaaaa-0000-0000-0000-000000000001',
   'سارة العلي', 'sara@alamal.sa',
   '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQyCgCf4c3wJWr7J0vMf1nZKi',
   'hr', NOW()),
  ('bbbbbbbb-0000-0000-0000-000000000003',
   'aaaaaaaa-0000-0000-0000-000000000001',
   'فهد العتيبي', 'fahad@alamal.sa',
   '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQyCgCf4c3wJWr7J0vMf1nZKi',
   'finance', NOW())
ON CONFLICT DO NOTHING;

-- Demo Employees
INSERT INTO employees (tenant_id, employee_number, name, email, phone, department, position, basic_salary, housing_allowance, transport_allowance, hire_date, status)
VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001', 'EMP-001', 'أحمد محمد السعيد', 'ahmed@company.sa', '+966501111111', 'المبيعات', 'مدير مبيعات', 12000, 2500, 800, '2022-01-01', 'active'),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'EMP-002', 'سارة خالد العلي', 'sara2@company.sa', '+966502222222', 'الموارد البشرية', 'مشرف HR', 9500, 1800, 600, '2022-03-15', 'active'),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'EMP-003', 'خالد عبدالله الشمري', 'khalid@company.sa', '+966503333333', 'المالية', 'محاسب', 8000, 1500, 600, '2021-07-01', 'active'),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'EMP-004', 'فاطمة محمد النجار', 'fatima@company.sa', '+966504444444', 'التسويق', 'منسق تسويق', 7500, 1200, 600, '2023-01-10', 'active'),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'EMP-005', 'عمر سعد باحارث', 'omar@company.sa', '+966505555555', 'المبيعات', 'مندوب مبيعات', 7000, 1000, 600, '2023-06-01', 'active')
ON CONFLICT DO NOTHING;

-- Demo Products
INSERT INTO products (tenant_id, sku, name, category, cost_price, selling_price, quantity, min_quantity, auto_reorder)
VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001', 'PROD-001', 'منتج إلكتروني A', 'إلكترونيات', 200, 450, 45, 10, true),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'PROD-002', 'منتج ملابس B', 'ملابس', 50, 120, 12, 15, true),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'PROD-003', 'منتج مكتبي C', 'مستلزمات', 15, 35, 0, 20, true),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'PROD-004', 'منتج غذائي D', 'غذاء', 8, 18, 340, 50, false),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'PROD-005', 'أثاث مكتبي E', 'أثاث', 600, 1200, 28, 5, false)
ON CONFLICT DO NOTHING;

-- Demo Customers
INSERT INTO customers (tenant_id, name, company, email, phone, whatsapp, city, pipeline_stage)
VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001', 'محمد الزهراني', 'شركة الزهراني', 'mz@company.sa', '+966511111111', '+966511111111', 'الرياض', 'won'),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'نورة العتيبي', 'مؤسسة النور', 'n@nur.sa', '+966522222222', '+966522222222', 'جدة', 'proposal'),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'سالم الدوسري', 'شركة الدوسري', 's@dosari.sa', '+966533333333', '+966533333333', 'الدمام', 'negotiation'),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'مجموعة المستقبل', 'مجموعة المستقبل', 'info@future.sa', '+966544444444', '+966544444444', 'الرياض', 'lead')
ON CONFLICT DO NOTHING;

-- Demo Workflow Templates
INSERT INTO workflow_templates (name, name_ar, description_ar, category, icon, nodes, edges, tags, is_featured)
VALUES
(
  'order_to_shipping',
  'طلب → شحن → إشعار العميل',
  'بمجرد وصول طلب جديد، تحقق من المخزون وأنشئ أمر شحن وأشعر العميل تلقائياً',
  'sales', '🛒',
  '[
    {"id":"n1","type":"trigger","name":"طلب جديد","config":{"event":"new_order"}},
    {"id":"n2","type":"condition","name":"فحص المخزون","config":{"field":"items.0.quantity","operator":"gt","value":"0"},"output_key":"stock_ok"},
    {"id":"n3","type":"integration_call","name":"إنشاء شحنة","config":{"action":"create_shipment"},"output_key":"shipment"},
    {"id":"n4","type":"send_whatsapp","name":"إشعار العميل","config":{"to":"{{customer.phone}}","message":"مرحباً {{customer.name}}، تم شحن طلبك رقم {{order.number}} 📦"}},
    {"id":"n5","type":"update_record","name":"تحديث حالة الطلب","config":{"table":"orders","id_field":"id","id_value":"{{order.id}}","fields":{"status":"shipped","tracking_number":"{{shipment.tracking}}"}}}
  ]',
  '[
    {"source":"n1","target":"n2"},
    {"source":"n2","target":"n3","branch":"true"},
    {"source":"n3","target":"n4"},
    {"source":"n4","target":"n5"}
  ]',
  ARRAY['مبيعات','شحن','إشعار'],
  true
),
(
  'attendance_to_payroll',
  'حضور → حساب الراتب',
  'احسب الراتب تلقائياً بناءً على بيانات الحضور من جهاز البصمة',
  'hr', '⏰',
  '[
    {"id":"n1","type":"trigger","name":"نهاية الشهر","config":{"event":"schedule","interval_minutes":43200}},
    {"id":"n2","type":"http_request","name":"جلب بيانات الحضور","config":{"method":"GET","url":"{{integration.fingerprint_url}}/attendance"},"output_key":"attendance"},
    {"id":"n3","type":"code","name":"حساب الراتب","config":{"code":"result.payroll = variables.attendance.map(a => ({employee_id: a.id, net: a.basic_salary * (a.days_present/22)}))"} },
    {"id":"n4","type":"send_email","name":"إرسال كشف الراتب","config":{"to":"{{hr.email}}","subject":"كشف رواتب {{month}}","body":"مرفق كشف الرواتب للمراجعة"}}
  ]',
  '[{"source":"n1","target":"n2"},{"source":"n2","target":"n3"},{"source":"n3","target":"n4"}]',
  ARRAY['موارد بشرية','رواتب'],
  true
),
(
  'leave_approval',
  'طلب إجازة → موافقة → إشعار',
  'دورة موافقة الإجازات مع إشعار تلقائي للموظف',
  'hr', '🏖️',
  '[
    {"id":"n1","type":"trigger","name":"طلب إجازة","config":{"event":"new_leave_request"}},
    {"id":"n2","type":"send_whatsapp","name":"إشعار المدير","config":{"to":"{{manager.phone}}","message":"طلب إجازة من {{employee.name}} من {{leave.start}} إلى {{leave.end}}"}},
    {"id":"n3","type":"send_whatsapp","name":"إشعار الموظف","config":{"to":"{{employee.phone}}","message":"تم استلام طلب إجازتك وهو قيد المراجعة ✅"}}
  ]',
  '[{"source":"n1","target":"n2"},{"source":"n2","target":"n3"}]',
  ARRAY['موارد بشرية','إجازات'],
  false
),
(
  'low_stock_reorder',
  'مخزون منخفض → طلب شراء تلقائي',
  'عند وصول المخزون للحد الأدنى، أنشئ طلب شراء وأشعر المسؤول',
  'inventory', '📦',
  '[
    {"id":"n1","type":"trigger","name":"مخزون منخفض","config":{"event":"low_stock"}},
    {"id":"n2","type":"create_record","name":"طلب شراء","config":{"table":"purchase_orders","fields":{"product_id":"{{product.id}}","quantity":"{{product.reorder_quantity}}"}}},
    {"id":"n3","type":"send_email","name":"إشعار المشتريات","config":{"to":"{{purchasing.email}}","subject":"طلب شراء عاجل: {{product.name}}","body":"المخزون الحالي {{product.quantity}} وحدة - الحد الأدنى {{product.min_quantity}}"}}
  ]',
  '[{"source":"n1","target":"n2"},{"source":"n2","target":"n3"}]',
  ARRAY['مخزون','مشتريات'],
  false
),
(
  'invoice_followup',
  'فاتورة → تذكير → تحصيل',
  'أرسل تذكيرات تلقائية للفواتير المتأخرة',
  'finance', '🧾',
  '[
    {"id":"n1","type":"trigger","name":"فاتورة متأخرة","config":{"event":"invoice_overdue"}},
    {"id":"n2","type":"send_whatsapp","name":"تذكير العميل","config":{"to":"{{customer.whatsapp}}","message":"تذكير: لديك فاتورة مستحقة رقم {{invoice.number}} بمبلغ {{invoice.total}} ريال"}},
    {"id":"n3","type":"update_record","name":"تحديث حالة الفاتورة","config":{"table":"invoices","id_field":"id","id_value":"{{invoice.id}}","fields":{"status":"overdue"}}}
  ]',
  '[{"source":"n1","target":"n2"},{"source":"n2","target":"n3"}]',
  ARRAY['مالية','فواتير'],
  false
)
ON CONFLICT DO NOTHING;

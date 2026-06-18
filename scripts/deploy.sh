#!/bin/bash
# =============================================
# سكريبت النشر على السيرفر
# deploy.sh
# =============================================
set -e

echo "🚀 بدء نشر أوتوفلو..."

# ===== متغيرات =====
APP_DIR="/opt/autoflow"
BACKUP_DIR="/opt/autoflow/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# ===== نسخة احتياطية لقاعدة البيانات =====
echo "📦 إنشاء نسخة احتياطية..."
mkdir -p $BACKUP_DIR
docker exec autoflow_db pg_dump -U autoflow_user autoflow > "$BACKUP_DIR/backup_$DATE.sql"
# احتفظ بآخر 7 نسخ فقط
ls -t $BACKUP_DIR/backup_*.sql | tail -n +8 | xargs -r rm
echo "✅ تم حفظ النسخة: backup_$DATE.sql"

# ===== تحديث الكود =====
echo "📥 جلب آخر تحديثات..."
cd $APP_DIR
git pull origin main

# ===== بناء ونشر =====
echo "🔨 بناء Docker images..."
docker-compose build --no-cache

echo "🔄 إيقاف الخدمات..."
docker-compose down

echo "▶️ تشغيل الخدمات الجديدة..."
docker-compose up -d

echo "⏳ انتظار بدء الخدمات..."
sleep 10

# ===== فحص الصحة =====
echo "🔍 فحص حالة الخادم..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health)
if [ "$HTTP_STATUS" = "200" ]; then
  echo "✅ الخادم يعمل بشكل صحيح!"
else
  echo "❌ خطأ! الخادم لا يستجيب (HTTP $HTTP_STATUS)"
  echo "🔄 التراجع للنسخة السابقة..."
  git stash
  docker-compose up -d
  exit 1
fi

# ===== تنظيف =====
echo "🧹 تنظيف الصور القديمة..."
docker image prune -f

echo ""
echo "✅ تم النشر بنجاح! — $(date)"
echo "🌐 الموقع: https://$(grep DOMAIN .env | cut -d= -f2)"

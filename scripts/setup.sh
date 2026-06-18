#!/bin/bash
# =============================================
# سكريبت الإعداد الأولي للسيرفر
# setup.sh — شغّله مرة واحدة فقط
# =============================================
set -e

echo "🛠️ إعداد أوتوفلو على السيرفر..."

# ===== Docker =====
echo "📦 تثبيت Docker..."
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker

# ===== Docker Compose =====
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# ===== App directory =====
mkdir -p /opt/autoflow
cd /opt/autoflow

# ===== .env من المثال =====
if [ ! -f .env ]; then
  cp .env.example .env
  echo ""
  echo "⚠️  عدّل ملف .env قبل المتابعة:"
  echo "    nano /opt/autoflow/.env"
  echo ""
  echo "أهم المتغيرات:"
  echo "  DOMAIN=autoflow.yourdomain.com"
  echo "  DB_PASSWORD=strong_password_here"
  echo "  JWT_SECRET=random_32_chars"
  echo "  ENCRYPTION_KEY=random_32_chars"
  echo "  HYPERPAY_ACCESS_TOKEN=your_token"
  exit 0
fi

# ===== SSL Certificate =====
echo "🔒 إعداد SSL..."
DOMAIN=$(grep DOMAIN .env | cut -d= -f2)
ADMIN_EMAIL=$(grep ADMIN_EMAIL .env | cut -d= -f2)

docker run --rm \
  -v /opt/autoflow/certbot_data:/etc/letsencrypt \
  -v /opt/autoflow/certbot_www:/var/www/certbot \
  -p 80:80 \
  certbot/certbot certonly \
  --standalone \
  --email $ADMIN_EMAIL \
  --agree-tos \
  --no-eff-email \
  -d $DOMAIN

# ===== Start services =====
echo "▶️ تشغيل الخدمات..."
docker-compose up -d

echo ""
echo "✅ تم الإعداد بنجاح!"
echo "🌐 https://$DOMAIN"
echo ""
echo "📋 أوامر مفيدة:"
echo "  docker-compose logs -f backend   # سجلات الباكند"
echo "  docker-compose restart backend   # إعادة تشغيل"
echo "  bash scripts/deploy.sh           # نشر تحديث جديد"

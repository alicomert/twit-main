# Ubuntu Sunucu PM2 Deployment Rehberi

## 🚀 Hızlı Başlangıç

### 1. Sunucu Hazırlığı

```bash
# Sistem güncellemesi
sudo apt update && sudo apt upgrade -y

# Node.js ve npm kurulumu (Node.js 18+)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2'yi global olarak kur
sudo npm install -g pm2

# Git kurulumu (eğer yoksa)
sudo apt install git -y
```

### 2. Proje Kurulumu

```bash
# Proje klasörüne git
cd /var/www

# Projeyi klonla (kendi repo URL'nizi kullanın)
sudo git clone YOUR_REPO_URL twitter-api
cd twitter-api

# Sahiplik ayarları
sudo chown -R $USER:$USER /var/www/twitter-api

# Bağımlılıkları kur
npm install
```

### 3. Environment Değişkenlerini Ayarla

```bash
# .env dosyasını düzenle
nano .env
```

**Önemli:** Aşağıdaki değişkenleri mutlaka güncelleyin:

```env
# Twitter API anahtarınızı buraya girin
TWITTER_API_KEY=your_real_twitter_api_key_here

# Güçlü bir bearer token oluşturun
BEARER_TOKEN=your_secure_bearer_token_here

# Port (varsayılan 3038)
PORT=3038

# Production ortamı
NODE_ENV=production
```

### 4. PM2 ile Başlatma

```bash
# PM2 ile uygulamayı başlat
npm run pm2:start

# Veya doğrudan:
pm2 start ecosystem.config.js --env production

# PM2'yi sistem başlangıcında otomatik başlatmak için
pm2 startup
pm2 save
```

## 📊 PM2 Yönetim Komutları

```bash
# Durum kontrolü
npm run pm2:status
# veya: pm2 status

# Logları görüntüle
npm run pm2:logs
# veya: pm2 logs twitter-api

# Uygulamayı yeniden başlat
npm run pm2:restart
# veya: pm2 restart twitter-api

# Uygulamayı durdur
npm run pm2:stop
# veya: pm2 stop twitter-api

# Uygulamayı sil
npm run pm2:delete
# veya: pm2 delete twitter-api

# Monitoring
npm run pm2:monit
# veya: pm2 monit
```

## 🔥 Firewall Ayarları

```bash
# UFW firewall'u etkinleştir
sudo ufw enable

# SSH portunu aç (22)
sudo ufw allow ssh

# API portunu aç (3038)
sudo ufw allow 3038

# HTTP ve HTTPS portlarını aç (isteğe bağlı)
sudo ufw allow 80
sudo ufw allow 443

# Firewall durumunu kontrol et
sudo ufw status
```

## 🌐 Nginx Reverse Proxy (İsteğe Bağlı)

```bash
# Nginx kurulumu
sudo apt install nginx -y

# Nginx konfigürasyonu
sudo nano /etc/nginx/sites-available/twitter-api
```

**Nginx konfigürasyon dosyası:**

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3038;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Siteyi etkinleştir
sudo ln -s /etc/nginx/sites-available/twitter-api /etc/nginx/sites-enabled/

# Nginx'i test et ve yeniden başlat
sudo nginx -t
sudo systemctl restart nginx
```

## 🔄 Otomatik Deployment

```bash
# Deployment script'i oluştur
nano deploy.sh
```

**deploy.sh içeriği:**

```bash
#!/bin/bash
echo "🚀 Twitter API Deployment başlıyor..."

# Git'ten son değişiklikleri çek
git pull origin main

# Bağımlılıkları güncelle
npm install

# PM2 ile uygulamayı yeniden yükle (zero-downtime)
pm2 reload twitter-api

echo "✅ Deployment tamamlandı!"
echo "📊 Durum kontrolü:"
pm2 status
```

```bash
# Script'i çalıştırılabilir yap
chmod +x deploy.sh

# Deployment çalıştır
./deploy.sh
```

## 📈 Monitoring ve Loglar

```bash
# Gerçek zamanlı loglar
pm2 logs twitter-api --lines 100

# Hata logları
pm2 logs twitter-api --err

# Log dosyalarını temizle
pm2 flush

# Sistem kaynaklarını izle
pm2 monit
```

## 🔧 Sorun Giderme

### Port zaten kullanımda hatası
```bash
# Portu kullanan process'i bul
sudo lsof -i :3038

# Process'i sonlandır
sudo kill -9 PID_NUMBER
```

### PM2 process'leri temizle
```bash
# Tüm PM2 process'lerini durdur
pm2 kill

# Yeniden başlat
pm2 start ecosystem.config.js --env production
```

### Log dosyaları çok büyüdü
```bash
# Log rotation ayarla
pm2 install pm2-logrotate

# Log rotation konfigürasyonu
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
pm2 set pm2-logrotate:compress true
```

## 🔒 Güvenlik Önerileri

1. **Bearer Token'ı güçlü yapın:**
   ```bash
   # Güçlü token oluştur
   openssl rand -hex 32
   ```

2. **Firewall'u doğru yapılandırın**
3. **SSH key authentication kullanın**
4. **Düzenli sistem güncellemeleri yapın**
5. **Log dosyalarını düzenli kontrol edin**

## 📞 API Test

```bash
# Health check
curl http://your-server-ip:3038/health

# API bilgileri
curl http://your-server-ip:3038/

# Bearer token ile test
curl -H "Authorization: Bearer your-bearer-token" \
     -X POST http://your-server-ip:3038/tweet \
     -H "Content-Type: application/json" \
     -d '{"text":"Test tweet from API"}'
```

## 🎯 Production Checklist

- [ ] Node.js 18+ kurulu
- [ ] PM2 global olarak kurulu
- [ ] .env dosyası doğru yapılandırılmış
- [ ] Twitter API anahtarı geçerli
- [ ] Bearer token güçlü ve güvenli
- [ ] Firewall portları açık
- [ ] PM2 startup kayıtlı
- [ ] Log rotation ayarlanmış
- [ ] Nginx reverse proxy (isteğe bağlı)
- [ ] SSL sertifikası (production için önerilen)

---

**🎉 Tebrikler! Twitter API'niz artık Ubuntu sunucusunda PM2 ile çalışıyor!**
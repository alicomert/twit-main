# Twitter API Server

Bu proje, Twitter API'sini kullanarak tweet'leri çekme, arama yapma ve çeşitli Twitter işlemlerini gerçekleştirme imkanı sunan bir Node.js sunucusudur. Coolify ve Nixpacks ile kolay deployment için optimize edilmiştir.

## 🚀 Özellikler

### 📖 Okuma İşlemleri (Kimlik Doğrulama Gerektirmez)
- 🐦 Kullanıcı tweet'lerini çekme
- 🔍 Tweet arama (kelime bazlı)
- 📊 Kullanıcı bilgilerini alma
- 📝 Belirli tweet detaylarını görüntüleme
- 🔍 Gelişmiş arama filtreleri

### ✍️ Yazma İşlemleri (Bearer Token Gerekli)
- 📝 Tweet atma
- 🖼️ Medya yükleme
- 💬 Tweet'lere yanıt verme
- 🗑️ Tweet silme
- ❤️ Tweet beğenme/beğenmeme
- 🔄 Retweet/Unretweet

### 🛡️ Güvenlik ve Performans
- 🔐 Bearer Token Authentication
- ⚡ Hızlı ve güvenilir API yanıtları
- 📱 CORS desteği
- 📊 Request logging
- 🚨 Comprehensive error handling
- 💚 Health check endpoint
- 🔄 Graceful shutdown handling

## 🛠️ Kurulum

### Yerel Geliştirme

1. **Projeyi klonlayın:**
   ```bash
   git clone <repository-url>
   cd twitter-api-server
   ```

2. **Bağımlılıkları yükleyin:**
   ```bash
   npm install
   ```

3. **Environment yapılandırması:**
   
   `.env` dosyasını düzenleyin:
   ```env
   # ===========================================
   # ZORUNLU YAPILANDIRMA
   # ===========================================
   
   # Twitter API Credentials (twitter-api-v2 için gerekli)
   API_KEY=your_twitter_api_key_here
   API_SECRET=your_twitter_api_secret_here
   ACCESS_TOKEN=your_access_token_here
   ACCESS_TOKEN_SECRET=your_access_token_secret_here
   
   # Bearer Token (Yazma işlemleri için gerekli)
   # GÜVENLİK UYARISI: Production'da mutlaka değiştirin!
   BEARER_TOKEN=your-secure-bearer-token-here
   
   # ===========================================
   # OPSİYONEL YAPILANDIRMA
   # ===========================================
   
   # Server Configuration
   PORT=3000
   NODE_ENV=production
   
   # Rate Limiting
   RATE_LIMIT_MAX=100
   RATE_LIMIT_WINDOW=15
   
   # Logging
   LOG_LEVEL=info
   ```

4. **Bearer Token oluşturun:**
   ```bash
   # Güvenli token oluşturma örneği
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

5. **Sunucuyu başlatın:**
   ```bash
   npm start
   ```

   Sunucu varsayılan olarak `http://localhost:3000` adresinde çalışacaktır.

### 🚀 Coolify ile Deployment

#### Gereksinimler
- Coolify v4+ kurulu server
- Git repository (GitHub, GitLab, vb.)

#### Deployment Adımları

1. **Coolify Dashboard'da yeni proje oluşturun**

2. **Build Pack ayarlarını yapın:**
   - **Build Pack:** `nixpacks`
   - **Port:** `3000`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

3. **Environment Variables ekleyin:**
   ```env
   API_KEY=your_twitter_api_key_here
   API_SECRET=your_twitter_api_secret_here
   ACCESS_TOKEN=your_access_token_here
   ACCESS_TOKEN_SECRET=your_access_token_secret_here
   BEARER_TOKEN=your-production-bearer-token
   NODE_ENV=production
   PORT=3000
   ```

4. **Deploy edin:**
   - Repository'yi bağlayın
   - Branch seçin (genellikle `main` veya `master`)
   - Deploy butonuna tıklayın

#### Coolify Özellikleri
- ✅ Otomatik SSL sertifikası
- ✅ Zero-downtime deployment
- ✅ Health check monitoring
- ✅ Automatic restarts
- ✅ Log management
- ✅ Environment variable management

## ⚙️ Konfigürasyon

### Temel Ayarlar
```javascript
// Twitter API Configuration
const API_KEY = 'API_KEY'; // Buraya gerçek API anahtarınızı yazın

// Server Configuration
const PORT = 3000;
const NODE_ENV = 'development';

// Optional Configuration
const RATE_LIMIT_WINDOW = 15;
const RATE_LIMIT_MAX = 100;
const LOG_LEVEL = 'info';
```

### Kimlik Doğrulama Modları
- **Guest Mode**: API anahtarı olmadan, sadece okuma işlemleri
- **User Mode**: API anahtarı ile, tüm işlemler mevcut

## 📚 API Kullanımı

### 🔓 Public Endpoints (Kimlik Doğrulama Gerektirmez)

#### 1. API Bilgileri ve Sağlık Kontrolü
```http
GET /
```

#### 2. Detaylı Sağlık Kontrolü
```http
GET /health
```

#### 3. Kullanıcı Tweet'lerini Alma
```http
GET /user/:username
```

**Örnek:**
```bash
curl "http://localhost:3000/user/elonmusk"
```

#### 4. Tweet Arama
```http
GET /search?q=keyword
```

**Örnek:**
```bash
curl "http://localhost:3000/search?q=javascript"
```

#### 5. Kullanıcı Bilgilerini Alma
```http
GET /user/:username/info
```

#### 6. Belirli Tweet'i Alma
```http
GET /tweet/:id
```

#### 7. Gelişmiş Arama
```http
GET /advanced-search?q=keyword&has_images=true&lang=en
```

### 🔒 Protected Endpoints (Bearer Token Gerekli)

> **Not:** Tüm yazma işlemleri için `Authorization: Bearer your-token` header'ı gereklidir.

#### 1. Tweet Atma
```http
POST /tweet
Authorization: Bearer your-token
Content-Type: application/json

{
  "text": "Merhaba dünya! 🌍"
}
```

#### 2. Medya Yükleme
```http
POST /upload
Authorization: Bearer your-token
Content-Type: multipart/form-data

# Form data ile dosya yükleme
```

#### 3. Tweet'e Yanıt Verme
```http
POST /tweet/:id/reply
Authorization: Bearer your-token
Content-Type: application/json

{
  "text": "Harika bir tweet! 👍"
}
```

#### 4. Tweet Silme
```http
DELETE /tweet/:id
Authorization: Bearer your-token
```

#### 5. Tweet Beğenme
```http
POST /tweet/:id/like
Authorization: Bearer your-token
```

#### 6. Tweet Beğenmeme
```http
DELETE /tweet/:id/like
Authorization: Bearer your-token
```

#### 7. Retweet
```http
POST /tweet/:id/retweet
Authorization: Bearer your-token
```

#### 8. Retweet Geri Alma
```http
DELETE /tweet/:id/retweet
```

### 🔐 Authentication

#### Bearer Token Kullanımı
```bash
# Örnek curl komutu
curl -X POST "http://localhost:3000/tweet" \
  -H "Authorization: Bearer your-secure-bearer-token-here" \
  -H "Content-Type: application/json" \
  -d '{"text": "API test tweet"}'
```

#### JavaScript/Fetch Örneği
```javascript
const response = await fetch('http://localhost:3000/tweet', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer your-secure-bearer-token-here',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    text: 'API test tweet'
  })
});

const result = await response.json();
console.log(result);
```

## 💡 Kullanım Örnekleri

### JavaScript ile Tweet Atma

```javascript
const tweetData = {
  text: "Rettiwt-API ile tweet atıyorum! 🚀"
};

fetch('http://localhost:3000/tweet', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(tweetData)
})
.then(response => response.json())
.then(data => console.log('Tweet atıldı:', data))
.catch(error => console.error('Hata:', error));
```

### Fotoğraf ile Tweet Atma

```javascript
// 1. Önce fotoğrafı yükle
const uploadData = {
  media_data: "base64_encoded_image_data",
  media_type: "image/jpeg"
};

fetch('http://localhost:3000/upload', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(uploadData)
})
.then(response => response.json())
.then(uploadResult => {
  // 2. Sonra media_id ile tweet at
  const tweetData = {
    text: "Fotoğraflı tweet! 📸",
    media_ids: [uploadResult.media_id]
  };
  
  return fetch('http://localhost:3000/tweet', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tweetData)
  });
})
.then(response => response.json())
.then(data => console.log('Fotoğraflı tweet atıldı:', data));
```

### Python ile Tweet Arama

```python
import requests

# Tweet arama
response = requests.get('http://localhost:3000/search', {
    'q': 'javascript',
    'count': 10
})

if response.status_code == 200:
    data = response.json()
    for tweet in data['tweets']:
        print(f"{tweet['author']}: {tweet['text']}")
else:
    print(f"Hata: {response.status_code}")
```

## 🚨 Hata Yönetimi

API, kapsamlı hata yönetimi ve logging sistemi içerir:

### HTTP Durum Kodları
- `200` - Başarılı
- `400` - Geçersiz istek / JSON parse hatası
- `401` - Kimlik doğrulama hatası
- `404` - Endpoint bulunamadı
- `429` - Rate limit aşıldı
- `500` - Sunucu hatası
- `503` - Servis kullanılamıyor

### Hata Yanıt Formatı

```json
{
  "success": false,
  "error": "Authentication Error",
  "message": "Invalid or missing authentication",
  "error_id": "abc123def",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "suggestion": "Include a valid Bearer token in the Authorization header",
  "example": "Authorization: Bearer your-token-here"
}
```

### Development Mode
Geliştirme modunda (`NODE_ENV=development`) ek hata detayları:
```json
{
  "details": {
    "original_message": "Detailed error message",
    "stack": "Error stack trace",
    "code": "ERROR_CODE"
  }
}
```

## 🔒 Güvenlik

### API Anahtarı Güvenliği
- API anahtarınızı asla public repository'lerde paylaşmayın
- Environment variables kullanın:
  ```bash
  export TWITTER_API_KEY="your_api_key_here"
  ```

### Rate Limiting
- Varsayılan: 100 istek / 15 dakika
- Aşırı kullanımda otomatik kısıtlama

## 🔧 Geliştirme

### Proje Yapısı

```
twitter-api-server/
├── server.js          # Ana sunucu dosyası
├── package.json       # Proje bağımlılıkları
├── .env              # Environment değişkenleri
├── .gitignore        # Git ignore kuralları
├── nixpacks.toml     # Coolify/Nixpacks konfigürasyonu
├── Dockerfile        # Docker konfigürasyonu (alternatif)
└── README.md         # Proje dokümantasyonu
```

### Geliştirme Modu

```bash
# Geliştirme modunda çalıştırma
npm run dev

# Production modunda çalıştırma
npm start
```

### 📊 Monitoring ve Logging

#### Request Logging
- Tüm HTTP istekleri otomatik loglanır
- Response time tracking
- IP adresi ve User-Agent bilgileri

#### Error Logging
- Unique error ID'ler
- Stack trace (development modunda)
- Request context bilgileri

#### Health Monitoring
```bash
# Sağlık kontrolü
curl http://localhost:3000/health

# Yanıt örneği
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "services": {
    "twitter_api": "connected",
    "bearer_auth": "configured"
  },
  "system": {
    "memory_usage": "45.2 MB",
    "platform": "linux"
  }
}
```

## 🔒 Güvenlik

### Önemli Güvenlik Notları

1. **Bearer Token Güvenliği:**
   - Production'da mutlaka güçlü, unique token kullanın
   - Token'ları asla kod içinde hardcode etmeyin
   - Düzenli olarak token'ları rotate edin

2. **Environment Variables:**
   - `.env` dosyası asla git'e commit edilmemelidir
   - Production'da environment variables kullanın

3. **API Keys:**
   - Twitter API anahtarlarını güvenli tutun
   - Gerekli minimum izinlerle API anahtarları oluşturun

### Rate Limiting
- Varsayılan: 100 istek / 15 dakika
- Coolify'da otomatik scaling ile yönetilebilir

## 🚀 Production Checklist

- [ ] Bearer token değiştirildi
- [ ] Twitter API anahtarları yapılandırıldı
- [ ] Environment variables ayarlandı
- [ ] Health check endpoint test edildi
- [ ] SSL sertifikası aktif
- [ ] Monitoring kuruldu
- [ ] Backup stratejisi belirlendi

## 📞 Destek

### Troubleshooting

**Problem:** Bearer token hatası
```bash
# Token'ı test edin
curl -H "Authorization: Bearer your-token" http://localhost:3000/health
```

**Problem:** Twitter API bağlantı hatası
- API anahtarlarını kontrol edin
- Twitter API quota'nızı kontrol edin
- Network bağlantısını test edin

**Problem:** Coolify deployment hatası
- Environment variables'ları kontrol edin
- Build logs'ları inceleyin
- Health check endpoint'ini test edin

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.
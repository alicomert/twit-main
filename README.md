# Twitter API Server with Rettiwt-API Integration

🐦 Kapsamlı Twitter API sunucusu - Tweet atma, medya yükleme, reply yapma ve daha fazlası!

## 📋 İçindekiler

- [Özellikler](#özellikler)
- [Kurulum](#kurulum)
- [Konfigürasyon](#konfigürasyon)
- [API Endpoint'leri](#api-endpointleri)
- [Kullanım Örnekleri](#kullanım-örnekleri)
- [Hata Yönetimi](#hata-yönetimi)
- [Güvenlik](#güvenlik)

## ✨ Özellikler

### 🔍 Okuma İşlemleri (Guest/User Auth)
- ✅ Kullanıcı tweet'lerini getirme
- ✅ Tweet arama (kelime bazlı)
- ✅ Belirli tweet detayları
- ✅ Kullanıcı bilgileri
- ✅ Gelişmiş arama filtreleri

### ✍️ Yazma İşlemleri (User Auth Gerekli)
- ✅ Tweet atma (metin)
- ✅ Medya yükleme (fotoğraf/video)
- ✅ Medya ile tweet atma
- ✅ Tweet'lere reply yapma
- ✅ Tweet silme
- ✅ Tweet beğenme/beğenmeme
- ✅ Retweet/unretweet

## 🚀 Kurulum

### Gereksinimler
- Node.js (v14 veya üzeri)
- npm veya yarn
- Twitter API anahtarı (Rettiwt-API için)

### Adımlar

1. **Projeyi klonlayın:**
```bash
git clone <repository-url>
cd twit-main
```

2. **Bağımlılıkları yükleyin:**
```bash
npm install
```

**Not**: Dotenv bağımlılığı otomatik olarak yüklenecektir.

3. **Environment variables dosyasını yapılandırın:**
```bash
# .env dosyasını düzenleyin
TWITTER_API_KEY=YOUR_TWITTER_API_KEY_HERE
```

**Alternatif olarak** doğrudan server.js dosyasında:
```javascript
// server.js dosyasında
const API_KEY = 'YOUR_TWITTER_API_KEY_HERE';
```

4. **Sunucuyu başlatın:**
```bash
node server.js
```

Sunucu `http://localhost:3000` adresinde çalışmaya başlayacaktır.

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

## 📡 API Endpoint'leri

### 🔍 Okuma İşlemleri

#### `GET /`
Sağlık kontrolü ve API bilgileri

**Örnek:**
```bash
curl http://localhost:3000/
```

#### `GET /user/:username`
Kullanıcının tweet'lerini getir

**Parametreler:**
- `username`: Twitter kullanıcı adı
- `count` (query): Tweet sayısı (varsayılan: 20)

**Örnek:**
```bash
curl "http://localhost:3000/user/elonmusk?count=10"
```

#### `GET /search`
Tweet arama

**Parametreler:**
- `q` (query): Arama kelimesi
- `count` (query): Sonuç sayısı (varsayılan: 20)

**Örnek:**
```bash
curl "http://localhost:3000/search?q=javascript&count=15"
```

#### `GET /tweet/:id`
Belirli bir tweet'in detayları

**Örnek:**
```bash
curl http://localhost:3000/tweet/1234567890123456789
```

#### `GET /user/:username/info`
Kullanıcı bilgileri

**Örnek:**
```bash
curl http://localhost:3000/user/elonmusk/info
```

#### `GET /advanced-search`
Gelişmiş arama filtreleri

**Parametreler:**
- `q`: Arama kelimesi
- `from_user`: Belirli kullanıcıdan
- `has_images`: Fotoğraflı tweet'ler (true/false)
- `has_videos`: Videolu tweet'ler (true/false)
- `count`: Sonuç sayısı

**Örnek:**
```bash
curl "http://localhost:3000/advanced-search?q=bitcoin&has_images=true&count=10"
```

### ✍️ Yazma İşlemleri (Auth Gerekli)

#### `POST /tweet`
Yeni tweet at

**Body:**
```json
{
  "text": "Merhaba dünya! 🌍",
  "media_ids": ["optional_media_id_1", "optional_media_id_2"]
}
```

**Örnek:**
```bash
curl -X POST http://localhost:3000/tweet \
  -H "Content-Type: application/json" \
  -d '{"text": "Merhaba dünya! 🌍"}'
```

#### `POST /upload`
Medya yükle (fotoğraf/video)

**Body:**
```json
{
  "media_data": "base64_encoded_media_data",
  "media_type": "image/jpeg"
}
```

**Desteklenen formatlar:**
- `image/jpeg`, `image/jpg`, `image/png`, `image/gif`
- `video/mp4`, `video/mov`

**Örnek:**
```bash
curl -X POST http://localhost:3000/upload \
  -H "Content-Type: application/json" \
  -d '{"media_data": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==", "media_type": "image/png"}'
```

#### `POST /tweet/:id/reply`
Tweet'e reply yap

**Body:**
```json
{
  "text": "Bu harika bir tweet! 👍",
  "media_ids": ["optional_media_id"]
}
```

**Örnek:**
```bash
curl -X POST http://localhost:3000/tweet/1234567890123456789/reply \
  -H "Content-Type: application/json" \
  -d '{"text": "Bu harika bir tweet! 👍"}'
```

#### `DELETE /tweet/:id`
Tweet'i sil

**Örnek:**
```bash
curl -X DELETE http://localhost:3000/tweet/1234567890123456789
```

#### `POST /tweet/:id/like`
Tweet'i beğen

**Örnek:**
```bash
curl -X POST http://localhost:3000/tweet/1234567890123456789/like
```

#### `DELETE /tweet/:id/like`
Tweet beğenisini kaldır

**Örnek:**
```bash
curl -X DELETE http://localhost:3000/tweet/1234567890123456789/like
```

#### `POST /tweet/:id/retweet`
Retweet yap

**Örnek:**
```bash
curl -X POST http://localhost:3000/tweet/1234567890123456789/retweet
```

#### `DELETE /tweet/:id/retweet`
Retweet'i geri al

**Örnek:**
```bash
curl -X DELETE http://localhost:3000/tweet/1234567890123456789/retweet
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

## ⚠️ Hata Yönetimi

### Yaygın Hata Kodları

- **400 Bad Request**: Geçersiz parametreler
- **401 Unauthorized**: API anahtarı gerekli
- **404 Not Found**: Tweet/kullanıcı bulunamadı
- **500 Internal Server Error**: Sunucu hatası

### Hata Yanıt Formatı

```json
{
  "success": false,
  "error": "Hata açıklaması",
  "message": "Detaylı hata mesajı",
  "suggestion": "Çözüm önerisi"
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

## 🛠️ Geliştirme

### Proje Yapısı
```
twit-main/
├── server.js          # Ana sunucu dosyası
├── package.json       # Bağımlılıklar
├── package-lock.json  # Bağımlılık kilidi
└── README.md          # Bu dosya
```

### Bağımlılıklar
- `express`: Web framework
- `cors`: Cross-origin resource sharing
- `rettiwt-api`: Twitter API client

## 📞 Destek

Sorularınız için:
1. GitHub Issues kullanın
2. Dokümantasyonu kontrol edin
3. API endpoint'lerini test edin

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

---

**Not**: Bu API, Rettiwt-API kütüphanesini kullanarak Twitter ile etkileşim kurar. Kullanım sırasında Twitter'ın hizmet şartlarına uygun davranın.
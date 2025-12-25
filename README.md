🤖 FanxyzXD WhatsApp Bot

Bot WhatsApp berbasis Node.js yang dirancang untuk kebutuhan otomatisasi, command handler, dan pengelolaan fitur WhatsApp secara modular. Project ini dibuat agar mudah dikembangkan, stabil, dan siap dipakai di Termux maupun VPS/Linux.


---

✨ Fitur Utama

🔗 Login WhatsApp menggunakan Pairing Code (tanpa QR)

♻️ Auto reconnect saat koneksi terputus

🧩 Sistem plugin (mudah tambah fitur)

💾 Penyimpanan database lokal

🖼️ Support media (image / video / audio)

⚡ Performa ringan & stabil



---

🧰 Teknologi yang Digunakan

Node.js

Baileys (WhatsApp Web API)

JavaScript (CommonJS)

Termux / Linux / VPS



---

📂 Struktur Repository

Struktur folder utama pada project ini:

FanxyzXD-WhatsappBot/
├── database/        # Penyimpanan data bot (user, config, dll)
├── lib/             # Core function & helper
├── media/           # File media bot (image, audio, video)
├── plugins/         # Command & fitur bot
├── .gitignore       # File yang diabaikan git
├── config.js        # Konfigurasi bot
├── index.js         # Entry point bot
├── package.json     # Dependency & script npm
└── README.md        # Dokumentasi project


---

🚀 Instalasi & Menjalankan Bot

1️⃣ Clone Repository

git clone https://github.com/FanxyzXD-II/FanxyzXD-WhatsappBot.git
cd FanxyzXD-WhatsappBot

2️⃣ Install Dependency

npm install

3️⃣ Konfigurasi Bot

Edit file config.js sesuai kebutuhan:

module.exports = {
  owner: "628xxxxxxxxx",
  botName: "FanxyzXD Bot"
}

4️⃣ Jalankan Bot

node index.js

Atau:

npm start


---

🔐 Login WhatsApp (Pairing Code)

1. Jalankan bot


2. Masukkan nomor WhatsApp aktif


3. Masukkan pairing code ke WhatsApp


4. Bot akan login & sesi tersimpan otomatis




---

🧩 Sistem Plugin

Semua fitur/command bot berada di folder:

/plugins

Menambah fitur baru cukup buat file baru:

plugins/menu.js
plugins/owner.js

Bot akan memuat plugin secara otomatis.


---

⚠️ Catatan Penting

❌ Jangan upload node_modules

❌ Jangan share folder database jika berisi data sensitif

✅ Gunakan Node.js versi terbaru

✅ Jalankan bot di environment Linux untuk stabilitas



---

🛠️ Pengembangan

Branching workflow:

git checkout -b fitur-baru

Commit perubahan:

git add .
git commit -m "tambah fitur baru"
git push origin fitur-baru


---

📄 Lisensi

Project ini menggunakan lisensi MIT. Bebas digunakan dan dikembangkan dengan tetap mencantumkan kredit.


---

👤 Developer

Nama: FanxyzXD

GitHub: https://github.com/FanxyzXD-II



---

⭐ Jika repository ini bermanfaat, jangan lupa beri Star di GitHub ⭐

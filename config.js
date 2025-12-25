/**
 * CONFIGURATION FILE - FANXYZXD II BETA
 * Sesuaikan variabel di bawah ini dengan data Anda.
 */

module.exports = {
  // Pengaturan Dasar Bot
  botName: "FanxyzXD II Beta",
  prefix: ".",
  
  // Daftar Owner (Gunakan nomor tanpa simbol, contoh: '628xxx')
  owner: [
    '628123456789', // Ganti dengan nomor WhatsApp Anda
    '628987654321'
  ],

  // API Keys (Dapatkan di web masing-masing)
  OPENAI_KEY: 'sk-proj-xxxxxxxxxxxxxxxxxxxx', // OpenAI API Key
  lolkey: 'YOUR_LOLHUMAN_API_KEY', // API Key dari lolhuman.xyz
  
  // Pengaturan Pembayaran (Untuk Fitur Store)
  dana: '0812-3456-7890',
  ovo: '0812-3456-7890',
  gopay: '0812-3456-7890',

  // Pengaturan Sistem
  sessionPath: './session',
  databasePath: './database',
  publicMode: true, // Jika false, hanya owner yang bisa menggunakan bot

  // Pesan Otomatis
  msg: {
    admin: "❌ Fitur ini hanya untuk Admin Grup!",
    owner: "❌ Fitur ini hanya untuk Owner Bot!",
    group: "❌ Fitur ini hanya dapat digunakan di dalam Grup!",
    wait: "⏳ Sedang diproses, mohon tunggu...",
    error: "❌ Terjadi kesalahan pada server API."
  }
}

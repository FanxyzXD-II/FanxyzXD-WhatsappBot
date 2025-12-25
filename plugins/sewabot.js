const fs = require('fs')
const path = require('path')

/* ================= DATABASE SYSTEM ================= */
const dbDir = path.join(__dirname, '../database')
const dbPath = path.join(dbDir, 'sewabot.json')

// Inisialisasi folder dan file database
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true })

function loadDB() {
  try {
    if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, '{}')
    return JSON.parse(fs.readFileSync(dbPath))
  } catch (e) {
    console.error('Error loading Sewa DB:', e)
    return {}
  }
}

function saveDB(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2))
}

let sewa = loadDB()

/* ================= LOGIC CHECKER ================= */
function isSewaAktif(jid) {
  if (!sewa[jid]) return false
  if (Date.now() > sewa[jid].expired) {
    delete sewa[jid]
    saveDB(sewa)
    return false
  }
  return true
}

function formatTime(ms) {
  let d = Math.floor(ms / (1000 * 60 * 60 * 24))
  let h = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  let m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
  return `${d} Hari, ${h} Jam, ${m} Menit`
}

module.exports = {
  command: ['sewabot', 'sewalist', 'addsewa', 'delsewa', 'ceksewa'],

  run: async ({ sock, msg, from, args, config }) => {
    const body = msg.message.conversation || msg.message.extendedTextMessage?.text || ''
    const sender = msg.key.participant || msg.key.remoteJid
    const p = config.prefix
    const cmd = body.slice(p.length).trim().split(/ +/)[0].toLowerCase()
    
    // Verifikasi Owner dari config
    const isOwner = config.owner.includes(sender.split('@')[0])

    /* ================= MENU SEWA ================= */
    if (cmd === 'sewabot') {
      const infoSewa = `💼 *LAYANAN SEWA BOT*

📌 *Price List:*
• 7 Hari  : Rp 5.000
• 30 Hari : Rp 15.000
• Permanen: Rp 30.000

📞 *Hubungi Owner:*
wa.me/${config.owner[0]}

Ketik *${p}ceksewa* untuk melihat sisa durasi di grup ini.`
      return sock.sendMessage(from, { text: infoSewa }, { quoted: msg })
    }

    /* ================= CEK SEWA ================= */
    if (cmd === 'ceksewa') {
      if (!isSewaAktif(from)) {
        return sock.sendMessage(from, { text: '❌ Grup ini belum terdaftar dalam list sewa atau masa aktif telah habis.' }, { quoted: msg })
      }

      const sisa = sewa[from].expired - Date.now()
      return sock.sendMessage(from, { text: `✅ *STATUS SEWA AKTIF*\n\n⏳ *Sisa Waktu:* ${formatTime(sisa)}` }, { quoted: msg })
    }

    /* ================= LIST SEWA (OWNER) ================= */
    if (cmd === 'sewalist') {
      if (!isOwner) return sock.sendMessage(from, { text: '⛔ Perintah ini hanya untuk Owner.' })

      let teks = '📋 *DAFTAR GRUP TERSEWA*\n\n'
      let count = 0
      for (const jid in sewa) {
        count++
        const sisa = sewa[jid].expired - Date.now()
        teks += `${count}. ID: ${jid}\n   ⏳ Expired: ${formatTime(sisa)}\n\n`
      }
      return sock.sendMessage(from, { text: count > 0 ? teks : ' Belum ada grup yang menyewa.' }, { quoted: msg })
    }

    /* ================= ADD SEWA (OWNER) ================= */
    if (cmd === 'addsewa') {
      if (!isOwner) return sock.sendMessage(from, { text: '⛔ Perintah ini hanya untuk Owner.' })

      const targetJid = args[0]
      const durasiHari = parseInt(args[1])

      if (!targetJid || isNaN(durasiHari)) {
        return sock.sendMessage(from, { text: `❗ *Format Salah*\n\nGunakan: *${p}addsewa* <id_grup> <jumlah_hari>\nContoh: *${p}addsewa 1203632@g.us 30*` }, { quoted: msg })
      }

      sewa[targetJid] = {
        expired: Date.now() + (durasiHari * 24 * 60 * 60 * 1000)
      }
      saveDB(sewa)

      await sock.sendMessage(from, { react: { text: '✅', key: msg.key } })
      return sock.sendMessage(from, { text: `✅ *BERHASIL TAMBAH SEWA*\n\n📍 Grup: ${targetJid}\n⏳ Durasi: ${durasiHari} Hari` }, { quoted: msg })
    }

    /* ================= DELETE SEWA (OWNER) ================= */
    if (cmd === 'delsewa') {
      if (!isOwner) return sock.sendMessage(from, { text: '⛔ Perintah ini hanya untuk Owner.' })

      const targetJid = args[0]
      if (!targetJid || !sewa[targetJid]) return sock.sendMessage(from, { text: '❌ ID Grup tidak ditemukan dalam database.' })

      delete sewa[targetJid]
      saveDB(sewa)
      return sock.sendMessage(from, { text: `🗑️ Berhasil menghapus sewa untuk: ${targetJid}` }, { quoted: msg })
    }
  },

  /* Middleware untuk index.js agar perintah lain tidak jalan jika belum sewa */
  isAllowed: (jid) => {
    return isSewaAktif(jid)
  }
}

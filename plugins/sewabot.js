const fs = require('fs')
const path = require('path')
const { reply, isOwner } = require('../lib/util')

/* ================= DATABASE ================= */
const dbPath = path.join(__dirname, '../database/sewabot.json')

function loadDB() {
  if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, '{}')
  return JSON.parse(fs.readFileSync(dbPath))
}

function saveDB(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2))
}

let sewa = loadDB()

function now() {
  return Date.now()
}

/* ================= CHECK AKTIF ================= */
function isSewaAktif(jid) {
  if (!sewa[jid]) return false
  if (now() > sewa[jid].expired) {
    delete sewa[jid]
    saveDB(sewa)
    return false
  }
  return true
}

module.exports = {
  command: [
    'sewabot',
    'sewalist',
    'addsewa',
    'delsewa',
    'ceksewa'
  ],

  run: async ({ sock, msg, from, args }) => {
    const body =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      ''

    const sender = msg.key.participant || msg.key.remoteJid
    const cmd = body.slice(1).split(' ')[0].toLowerCase()

    /* ================= MENU SEWA ================= */
    if (cmd === 'sewabot') {
      return reply(
        sock,
        from,
`💼 *SEWA BOT*

📌 Harga:
• 7 Hari  : Rp 5.000
• 30 Hari : Rp 15.000
• Permanen: Rp 30.000

📞 Hubungi Owner untuk sewa
Ketik: .ceksewa`,
        msg
      )
    }

    /* ================= CEK SEWA ================= */
    if (cmd === 'ceksewa') {
      if (!isSewaAktif(from)) {
        return reply(sock, from, '❌ Bot belum disewa / masa aktif habis', msg)
      }

      const s = sewa[from]
      const sisa = Math.floor((s.expired - now()) / (1000 * 60 * 60 * 24))

      return reply(
        sock,
        from,
`✅ *SEWA AKTIF*

Sisa waktu: ${sisa} hari`,
        msg
      )
    }

    /* ================= LIST SEWA ================= */
    if (cmd === 'sewalist') {
      if (!isOwner(sender)) return reply(sock, from, '⛔ Owner only', msg)

      let teks = '📋 *LIST SEWA BOT*\n\n'
      let i = 1

      for (const jid in sewa) {
        const sisa = Math.floor((sewa[jid].expired - now()) / (1000 * 60 * 60 * 24))
        teks += `${i++}. ${jid.replace('@g.us','')}\n   ⏳ ${sisa} hari\n\n`
      }

      return reply(sock, from, teks || 'Belum ada sewa', msg)
    }

    /* ================= ADD SEWA ================= */
    if (cmd === 'addsewa') {
      if (!isOwner(sender)) return reply(sock, from, '⛔ Owner only', msg)

      const id = args[0]
      const hari = parseInt(args[1])

      if (!id || !hari)
        return reply(
          sock,
          from,
          '❗ Format:\n.addsewa id_grup hari\n\nContoh:\n.addsewa 120xxxxx@g.us 30',
          msg
        )

      sewa[id] = {
        expired: now() + hari * 24 * 60 * 60 * 1000
      }

      saveDB(sewa)

      return reply(
        sock,
        from,
        `✅ Sewa ditambahkan\nID: ${id}\nDurasi: ${hari} hari`,
        msg
      )
    }

    /* ================= DELETE SEWA ================= */
    if (cmd === 'delsewa') {
      if (!isOwner(sender)) return reply(sock, from, '⛔ Owner only', msg)

      const id = args[0]
      if (!id || !sewa[id])
        return reply(sock, from, '❌ ID tidak ditemukan', msg)

      delete sewa[id]
      saveDB(sewa)

      return reply(sock, from, `🗑️ Sewa dihapus: ${id}`, msg)
    }
  },

  /* ================= MIDDLEWARE ================= */
  isAllowed: (jid) => {
    return isSewaAktif(jid)
  }
}
const fs = require('fs')
const path = require('path')
const { delay } = require('@whiskeysockets/baileys')

/* ================= DATABASE SYSTEM ================= */
const dbDir = path.join(__dirname, '../database')
const sewaPath = path.join(dbDir, 'sewabot.json')

// Inisialisasi folder database otomatis
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true })

const loadSewa = () => {
  try {
    return fs.existsSync(sewaPath) ? JSON.parse(fs.readFileSync(sewaPath)) : {}
  } catch (e) {
    return {}
  }
}

const saveSewa = data => fs.writeFileSync(sewaPath, JSON.stringify(data, null, 2))

module.exports = {
  command: [
    'ownermenu',
    'addsewa',
    'delsewa',
    'ceksaldo',
    'broadcast',
    'bc',
    'eval'
  ],

  run: async ({ sock, msg, from, args, config }) => {
    const sender = msg.key.participant || msg.key.remoteJid
    const senderNum = sender.split('@')[0].split(':')[0]

    // VERIFIKASI OWNER
    if (!config.owner.includes(senderNum)) {
      return sock.sendMessage(from, { text: config.msg.owner })
    }

    const p = config.prefix
    const body = msg.message.conversation || msg.message.extendedTextMessage?.text || ''
    const cmd = body.slice(p.length).trim().split(/ +/)[0].toLowerCase()

    /* ================= OWNER MENU ================= */
    if (cmd === 'ownermenu') {
      const menuText = `╭━━〔 👑 *OWNER MENU* 〕━━╮
┃ • *${p}addsewa* ID hari
┃ • *${p}delsewa* ID
┃ • *${p}broadcast* teks
┃ • *${p}ceksaldo*
┃ • *${p}eval* kode
╰━━━━━━━━━━━━━━━━━━━━╯`
      return sock.sendMessage(from, { text: menuText }, { quoted: msg })
    }

    /* ================= ADD SEWA ================= */
    if (cmd === 'addsewa') {
      if (args.length < 2) return sock.sendMessage(from, { text: `❗ Format: *${p}addsewa* ID_Grup Hari` })

      const targetId = args[0]
      const hari = parseInt(args[1])
      const db = loadSewa()

      db[targetId] = {
        expired: Date.now() + (hari * 24 * 60 * 60 * 1000)
      }
      saveSewa(db)

      await sock.sendMessage(from, { react: { text: '✅', key: msg.key } })
      return sock.sendMessage(from, { text: `✅ Berhasil menambah sewa grup:\nID: ${targetId}\nDurasi: ${hari} Hari` })
    }

    /* ================= DELETE SEWA ================= */
    if (cmd === 'delsewa') {
      if (!args[0]) return sock.sendMessage(from, { text: `❗ Format: *${p}delsewa* ID_Grup` })

      const targetId = args[0]
      const db = loadSewa()

      if (!db[targetId]) return sock.sendMessage(from, { text: '❌ ID tidak ditemukan di database.' })

      delete db[targetId]
      saveSewa(db)
      return sock.sendMessage(from, { text: `🗑️ Sewa untuk ${targetId} telah dihapus.` })
    }

    /* ================= BROADCAST ================= */
    if (cmd === 'broadcast' || cmd === 'bc') {
      const text = args.join(' ')
      if (!text) return sock.sendMessage(from, { text: '❗ Masukkan teks broadcast!' })

      // Mendapatkan daftar kontak/grup dari store atau metadata (tergantung implementasi Baileys Anda)
      // Di sini kita asumsikan mengirim ke daftar member grup tempat bot berada
      const metadata = await sock.groupMetadata(from)
      const targets = metadata.participants.map(v => v.id)

      await sock.sendMessage(from, { text: `📢 Memulai broadcast ke ${targets.length} target...` })

      let success = 0
      for (const jid of targets) {
        try {
          await sock.sendMessage(jid, { text: `📢 *BROADCAST OWNER*\n\n${text}` })
          success++
          await delay(2000) // Delay aman
        } catch (e) {
          console.error('BC Error:', e)
        }
      }

      return sock.sendMessage(from, { text: `✅ Broadcast selesai!\n✔️ Berhasil: ${success}\n❌ Gagal: ${targets.length - success}` })
    }

    /* ================= CEK SALDO ================= */
    if (cmd === 'ceksaldo') {
      const dana = config.dana || 'Tidak diset'
      return sock.sendMessage(from, { text: `💰 *INFO SALDO*\n\nE-Wallet: ${dana}\nStatus: Aktif\nSaldo: Rp0 (Dummy)` })
    }

    /* ================= EVAL ================= */
    if (cmd === 'eval') {
      const code = args.join(' ')
      if (!code) return
      try {
        let evaled = await eval(code)
        if (typeof evaled !== 'string') evaled = require('util').inspect(evaled)
        return sock.sendMessage(from, { text: evaled })
      } catch (e) {
        return sock.sendMessage(from, { text: String(e) })
      }
    }
  }
}

const fs = require('fs')
const chalk = require('chalk')

const sewaPath = './database/sewa.json'
if (!fs.existsSync(sewaPath)) fs.writeFileSync(sewaPath, '{}')

const loadSewa = () => JSON.parse(fs.readFileSync(sewaPath))
const saveSewa = data =>
  fs.writeFileSync(sewaPath, JSON.stringify(data, null, 2))

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
    const sender =
      msg.key.participant || msg.key.remoteJid
    const senderNum = sender.split('@')[0]

    // CEK OWNER
    if (!config.owner.includes(senderNum)) {
      return sock.sendMessage(from, {
        text: '⛔ Perintah ini khusus OWNER'
      })
    }

    const command =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      ''

    const cmd = command.slice(1).split(' ')[0].toLowerCase()

    /* ================= OWNER MENU ================= */
    if (cmd === 'ownermenu') {
      return sock.sendMessage(from, {
        text: `
╭━━〔 👑 OWNER MENU 〕━━╮
┃ • .addsewa nomor hari
┃ • .delsewa nomor
┃ • .broadcast teks
┃ • .ceksaldo
┃ • .eval kode
╰━━━━━━━━━━━━━━━━━━━━╯
`
      })
    }

    /* ================= ADD SEWA ================= */
    if (cmd === 'addsewa') {
      if (args.length < 2)
        return sock.sendMessage(from, {
          text: '❗ Format: .addsewa 628xxx 30'
        })

      const nomor = args[0] + '@s.whatsapp.net'
      const hari = parseInt(args[1])

      const db = loadSewa()
      db[nomor] = {
        expired: Date.now() + hari * 86400000
      }
      saveSewa(db)

      await sock.sendMessage(nomor, {
        text: `✅ Sewa bot aktif ${hari} hari`
      })

      return sock.sendMessage(from, {
        text: `✔️ Berhasil menambah sewa ${args[0]}`
      })
    }

    /* ================= DELETE SEWA ================= */
    if (cmd === 'delsewa') {
      if (!args[0])
        return sock.sendMessage(from, {
          text: '❗ Format: .delsewa 628xxx'
        })

      const nomor = args[0] + '@s.whatsapp.net'
      const db = loadSewa()

      if (!db[nomor])
        return sock.sendMessage(from, {
          text: '❌ Nomor tidak ada di database'
        })

      delete db[nomor]
      saveSewa(db)

      return sock.sendMessage(from, {
        text: `🗑️ Sewa ${args[0]} dihapus`
      })
    }

    /* ================= BROADCAST ================= */
    if (cmd === 'broadcast' || cmd === 'bc') {
      const text = args.join(' ')
      if (!text)
        return sock.sendMessage(from, {
          text: '❗ Teks broadcast kosong'
        })

      const chats = await sock.chats.all()
      let count = 0

      for (const chat of chats) {
        await sock.sendMessage(chat.id, { text })
        count++
      }

      return sock.sendMessage(from, {
        text: `📢 Broadcast terkirim ke ${count} chat`
      })
    }

    /* ================= CEK SALDO (DUMMY) ================= */
    if (cmd === 'ceksaldo') {
      return sock.sendMessage(from, {
        text: '💰 Saldo owner: Rp0 (dummy)'
      })
    }

    /* ================= EVAL (HATI-HATI) ================= */
    if (cmd === 'eval') {
      try {
        const code = args.join(' ')
        const result = eval(code)
        return sock.sendMessage(from, {
          text: String(result)
        })
      } catch (e) {
        return sock.sendMessage(from, {
          text: String(e)
        })
      }
    }
  }
}
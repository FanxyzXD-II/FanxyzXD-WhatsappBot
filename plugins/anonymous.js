const { downloadContentFromMessage } = require('@whiskeysockets/baileys')

// Memory storage
const anon = {
  waiting: [],
  pair: {}
}

function removeWaiting(jid) {
  anon.waiting = anon.waiting.filter(v => v !== jid)
}

function endChat(jid, sock) {
  const partner = anon.pair[jid]
  if (partner) {
    delete anon.pair[partner]
    sock.sendMessage(partner, { text: '🛑 Partner telah mengakhiri chat.' })
  }
  delete anon.pair[jid]
  removeWaiting(jid)
}

module.exports = {
  command: ['anon', 'next', 'stop', 'skip', 'sendprofile'],

  run: async ({ sock, msg, from, args, config, isGroup, pushname }) => {
    // Hindari penggunaan anonymous di dalam grup
    if (isGroup) return

    const body =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      msg.message.imageMessage?.caption ||
      msg.message.videoMessage?.caption ||
      ''

    const cmd = body.slice(config.prefix.length).trim().split(/ +/)[0].toLowerCase()

    /* ================= START / SEARCH ================= */
    if (cmd === 'anon') {
      if (anon.pair[from]) return sock.sendMessage(from, { text: `⚠️ Kamu masih dalam chat!\nKetik *${config.prefix}stop* untuk keluar.` }, { quoted: msg })
      if (anon.waiting.includes(from)) return sock.sendMessage(from, { text: '⏳ Masih menunggu partner...' }, { quoted: msg })

      if (anon.waiting.length > 0) {
        const partner = anon.waiting.shift()
        anon.pair[from] = partner
        anon.pair[partner] = from

        const startMsg = `✅ Partner ditemukan!\n\nKetik *${config.prefix}next* untuk cari baru\nKetik *${config.prefix}sendprofile* untuk kirim profil WA Anda.`
        await sock.sendMessage(from, { text: startMsg })
        await sock.sendMessage(partner, { text: startMsg })
      } else {
        anon.waiting.push(from)
        await sock.sendMessage(from, { text: '⏳ Mencari partner... Mohon tunggu.' }, { quoted: msg })
      }
      return
    }

    /* ================= SEND PROFILE ================= */
    if (cmd === 'sendprofile') {
      const partner = anon.pair[from]
      if (!partner) return sock.sendMessage(from, { text: '❌ Kamu harus punya pasangan dulu!' })

      // Mengirim VCard (Kontak)
      const vcard = 'BEGIN:VCARD\n' +
                    'VERSION:3.0\n' +
                    `FN:${pushname}\n` +
                    `TEL;type=CELL;type=VOICE;waid=${from.split('@')[0]}:+${from.split('@')[0]}\n` +
                    'END:VCARD'

      await sock.sendMessage(partner, {
        contacts: {
          displayName: pushname,
          contacts: [{ vcard }]
        }
      })
      
      return sock.sendMessage(from, { text: '✅ Profil kamu telah dikirim ke partner.' })
    }

    /* ================= NEXT / SKIP ================= */
    if (cmd === 'next' || cmd === 'skip') {
      endChat(from, sock)
      anon.waiting.push(from)
      return sock.sendMessage(from, { text: '🔄 Mencari partner baru...' })
    }

    /* ================= STOP ================= */
    if (cmd === 'stop') {
      if (!anon.pair[from] && !anon.waiting.includes(from)) return sock.sendMessage(from, { text: '❌ Kamu tidak sedang dalam sesi.' })
      endChat(from, sock)
      return sock.sendMessage(from, { text: '🛑 Sesi anonymous dihentikan.' })
    }

    /* ================= RELAY SYSTEM ================= */
    if (anon.pair[from] && !body.startsWith(config.prefix)) {
      const partner = anon.pair[from]
      try {
        // Forward message secara langsung (teks & media)
        await sock.sendMessage(partner, { forward: msg })
      } catch (e) {
        console.error('Relay Error:', e)
      }
    }
  }
}

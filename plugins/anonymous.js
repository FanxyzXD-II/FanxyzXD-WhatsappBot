const { reply } = require('../lib/util')

// Memory anonymous (RAM). Aman & ringan.
// Kalau mau permanen, bisa ganti ke JSON.
const anon = {
  waiting: [],        // user yang menunggu pasangan
  pair: {}            // jid -> jid pasangan
}

function removeWaiting(jid) {
  anon.waiting = anon.waiting.filter(v => v !== jid)
}

function endChat(jid, sock) {
  const partner = anon.pair[jid]
  if (partner) {
    delete anon.pair[partner]
    sock.sendMessage(partner, { text: '❌ Partner meninggalkan chat.' })
  }
  delete anon.pair[jid]
  removeWaiting(jid)
}

module.exports = {
  command: ['anon', 'next', 'stop'],

  run: async ({ sock, msg, from, args }) => {
    const body =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      msg.message.imageMessage?.caption ||
      msg.message.videoMessage?.caption ||
      ''

    const cmd = body.slice(1).split(' ')[0].toLowerCase()

    /* ================= START ANON ================= */
    if (cmd === 'anon') {
      // sudah berpasangan?
      if (anon.pair[from]) {
        return reply(sock, from, '⚠️ Kamu masih dalam anonymous chat.\nKetik .stop untuk keluar.', msg)
      }

      // sudah menunggu?
      if (anon.waiting.includes(from)) {
        return reply(sock, from, '⏳ Kamu sudah menunggu partner...', msg)
      }

      // cari partner
      if (anon.waiting.length > 0) {
        const partner = anon.waiting.shift()
        anon.pair[from] = partner
        anon.pair[partner] = from

        await sock.sendMessage(from, { text: '✅ Partner ditemukan! Mulai chat.' })
        await sock.sendMessage(partner, { text: '✅ Partner ditemukan! Mulai chat.' })
      } else {
        anon.waiting.push(from)
        return reply(sock, from, '⏳ Menunggu partner anonymous...', msg)
      }
      return
    }

    /* ================= NEXT ================= */
    if (cmd === 'next') {
      endChat(from, sock)
      return reply(sock, from, '🔄 Mencari partner baru...\nKetik .anon', msg)
    }

    /* ================= STOP ================= */
    if (cmd === 'stop') {
      endChat(from, sock)
      return reply(sock, from, '🛑 Anonymous chat dihentikan.', msg)
    }

    /* ================= FORWARD MESSAGE ================= */
    // Kalau user sedang anonymous & bukan command
    if (anon.pair[from] && !body.startsWith('.')) {
      const partner = anon.pair[from]

      // forward semua jenis pesan dasar
      if (msg.message.conversation || msg.message.extendedTextMessage) {
        return sock.sendMessage(partner, { text: body })
      }

      if (msg.message.imageMessage) {
        return sock.sendMessage(
          partner,
          {
            image: await sock.downloadMediaMessage(msg),
            caption: msg.message.imageMessage.caption || ''
          }
        )
      }

      if (msg.message.videoMessage) {
        return sock.sendMessage(
          partner,
          {
            video: await sock.downloadMediaMessage(msg),
            caption: msg.message.videoMessage.caption || ''
          }
        )
      }

      if (msg.message.audioMessage) {
        return sock.sendMessage(
          partner,
          {
            audio: await sock.downloadMediaMessage(msg),
            mimetype: 'audio/ogg; codecs=opus',
            ptt: true
          }
        )
      }
    }
  }
}
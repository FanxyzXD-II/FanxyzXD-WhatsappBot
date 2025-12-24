const axios = require('axios')
const { reply } = require('../lib/util')

module.exports = {
  command: [
    'randomvideo',
    'videomenu',
    'asupan',
    'tiktokrandom',
    'animevideo',
    'memvideo'
  ],

  run: async ({ sock, msg, from }) => {
    const body =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      ''

    const cmd = body.slice(1).split(' ')[0].toLowerCase()

    /* ================= MENU ================= */
    if (cmd === 'videomenu' || cmd === 'randomvideo') {
      return reply(
        sock,
        from,
`🎥 *RANDOM VIDEO MENU*

• .asupan
• .tiktokrandom
• .animevideo
• .memvideo`,
        msg
      )
    }

    try {
      /* ================= ASUPAN ================= */
      if (cmd === 'asupan') {
        reply(sock, from, '⏳ Mengambil video...', msg)

        const res = await axios.get(
          'https://api.lolhuman.xyz/api/random/asupan?apikey=demo'
        )

        return sock.sendMessage(
          from,
          {
            video: { url: res.data.result },
            caption: '🎵 Asupan Random'
          },
          { quoted: msg }
        )
      }

      /* ================= TIKTOK RANDOM ================= */
      if (cmd === 'tiktokrandom') {
        reply(sock, from, '⏳ Mengambil TikTok...', msg)

        const res = await axios.get(
          'https://api.lolhuman.xyz/api/random/tiktok?apikey=demo'
        )

        return sock.sendMessage(
          from,
          {
            video: { url: res.data.result },
            caption: '🎶 TikTok Random'
          },
          { quoted: msg }
        )
      }

      /* ================= ANIME VIDEO ================= */
      if (cmd === 'animevideo') {
        reply(sock, from, '⏳ Mengambil anime...', msg)

        const res = await axios.get(
          'https://api.lolhuman.xyz/api/random/animevideo?apikey=demo'
        )

        return sock.sendMessage(
          from,
          {
            video: { url: res.data.result },
            caption: '🎌 Anime Video'
          },
          { quoted: msg }
        )
      }

      /* ================= MEME VIDEO ================= */
      if (cmd === 'memvideo') {
        reply(sock, from, '⏳ Mengambil meme...', msg)

        const res = await axios.get(
          'https://api.lolhuman.xyz/api/random/memevideo?apikey=demo'
        )

        return sock.sendMessage(
          from,
          {
            video: { url: res.data.result },
            caption: '😂 Meme Video'
          },
          { quoted: msg }
        )
      }
    } catch (e) {
      console.error(e)
      return reply(sock, from, '❌ Gagal mengambil video', msg)
    }
  }
}
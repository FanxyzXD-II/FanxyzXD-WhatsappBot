const axios = require('axios')
const { reply } = require('../lib/util')

module.exports = {
  command: [
    'randomphoto',
    'photomenu',
    'animepic',
    'cewek',
    'cowok',
    'kucing',
    'meme'
  ],

  run: async ({ sock, msg, from }) => {
    const body =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      ''

    const cmd = body.slice(1).split(' ')[0].toLowerCase()

    /* ================= MENU ================= */
    if (cmd === 'randomphoto' || cmd === 'photomenu') {
      return reply(
        sock,
        from,
`📸 *RANDOM PHOTO MENU*

• .animepic
• .cewek
• .cowok
• .kucing
• .meme`,
        msg
      )
    }

    try {
      /* ================= ANIME ================= */
      if (cmd === 'animepic') {
        reply(sock, from, '⏳ Mengambil foto anime...', msg)

        const res = await axios.get(
          'https://api.lolhuman.xyz/api/random/anime?apikey=demo'
        )

        return sock.sendMessage(
          from,
          {
            image: { url: res.data.result },
            caption: '🎌 Anime Random'
          },
          { quoted: msg }
        )
      }

      /* ================= CEWEK ================= */
      if (cmd === 'cewek') {
        reply(sock, from, '⏳ Mengambil foto...', msg)

        const res = await axios.get(
          'https://api.lolhuman.xyz/api/random/cewek?apikey=demo'
        )

        return sock.sendMessage(
          from,
          {
            image: { url: res.data.result },
            caption: '👧 Random Cewek'
          },
          { quoted: msg }
        )
      }

      /* ================= COWOK ================= */
      if (cmd === 'cowok') {
        reply(sock, from, '⏳ Mengambil foto...', msg)

        const res = await axios.get(
          'https://api.lolhuman.xyz/api/random/cowok?apikey=demo'
        )

        return sock.sendMessage(
          from,
          {
            image: { url: res.data.result },
            caption: '👦 Random Cowok'
          },
          { quoted: msg }
        )
      }

      /* ================= KUCING ================= */
      if (cmd === 'kucing') {
        reply(sock, from, '⏳ Mengambil foto kucing...', msg)

        const res = await axios.get(
          'https://api.thecatapi.com/v1/images/search'
        )

        return sock.sendMessage(
          from,
          {
            image: { url: res.data[0].url },
            caption: '🐱 Kucing Random'
          },
          { quoted: msg }
        )
      }

      /* ================= MEME ================= */
      if (cmd === 'meme') {
        reply(sock, from, '⏳ Mengambil meme...', msg)

        const res = await axios.get(
          'https://meme-api.com/gimme'
        )

        return sock.sendMessage(
          from,
          {
            image: { url: res.data.url },
            caption: `😂 Meme Random\n${res.data.title}`
          },
          { quoted: msg }
        )
      }
    } catch (e) {
      console.error(e)
      return reply(sock, from, '❌ Gagal mengambil foto', msg)
    }
  }
}
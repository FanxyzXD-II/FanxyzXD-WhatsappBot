const axios = require('axios')
const { reply } = require('../lib/util')

/*
Template yang dipakai (contoh):
- neon
- glitch
- blackpink
- gaming
- silver
*/

const templates = {
  neon: 'https://ephoto360.com/neon-text-effect-online-879.html',
  glitch: 'https://ephoto360.com/create-digital-glitch-text-effects-online-767.html',
  blackpink: 'https://ephoto360.com/blackpink-style-logo-maker-online-710.html',
  gaming: 'https://ephoto360.com/free-gaming-logo-maker-online-564.html',
  silver: 'https://ephoto360.com/silver-text-effect-372.html'
}

module.exports = {
  command: [
    'ephoto',
    'ephotomenu',
    'neon',
    'glitch',
    'blackpink',
    'gaming',
    'silver'
  ],

  run: async ({ sock, msg, from, args }) => {
    const body =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      ''

    const cmd = body.slice(1).split(' ')[0].toLowerCase()
    const text = args.join(' ')

    /* ================= MENU ================= */
    if (cmd === 'ephotomenu' || cmd === 'ephoto') {
      let list = '🖼️ *EPHOTO MENU*\n\n'
      for (let t in templates) {
        list += `• .${t} <teks>\n`
      }
      return reply(sock, from, list, msg)
    }

    /* ================= VALIDASI ================= */
    if (!templates[cmd]) return
    if (!text)
      return reply(
        sock,
        from,
        `❗ Masukkan teks\nContoh:\n.${cmd} FanxyzXD`,
        msg
      )

    try {
      reply(sock, from, '⏳ Membuat gambar...', msg)

      // API publik (contoh lolhuman)
      const res = await axios.get(
        `https://api.lolhuman.xyz/api/ephoto?apikey=demo&url=${encodeURIComponent(
          templates[cmd]
        )}&text=${encodeURIComponent(text)}`
      )

      if (!res.data || !res.data.result)
        return reply(sock, from, '❌ Gagal membuat gambar', msg)

      await sock.sendMessage(
        from,
        {
          image: { url: res.data.result },
          caption: `✨ *EPHOTO RESULT*\nStyle: ${cmd}`
        },
        { quoted: msg }
      )
    } catch (e) {
      console.error(e)
      reply(sock, from, '❌ Error saat membuat ephoto', msg)
    }
  }
}
const axios = require('axios')
const { reply } = require('../lib/util')

module.exports = {
  command: [
    'animemenu',
    'anime',
    'waifu',
    'neko',
    'animequote'
  ],

  run: async ({ sock, msg, from, args }) => {
    const body =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      msg.message.imageMessage?.caption ||
      ''

    const cmd = body.slice(1).split(' ')[0].toLowerCase()

    /* ================= MENU ================= */
    if (cmd === 'animemenu') {
      return reply(
        sock,
        from,
`🎌 *ANIME MENU*

• .anime → random anime image
• .waifu → random waifu
• .neko → random neko
• .animequote → quote anime`,
        msg
      )
    }

    /* ================= RANDOM ANIME ================= */
    if (cmd === 'anime') {
      const res = await axios.get('https://api.waifu.pics/sfw/waifu')
      return sock.sendMessage(
        from,
        {
          image: { url: res.data.url },
          caption: '🎌 Random Anime'
        },
        { quoted: msg }
      )
    }

    /* ================= WAIFU ================= */
    if (cmd === 'waifu') {
      const res = await axios.get('https://api.waifu.pics/sfw/waifu')
      return sock.sendMessage(
        from,
        {
          image: { url: res.data.url },
          caption: '💖 Waifu'
        },
        { quoted: msg }
      )
    }

    /* ================= NEKO ================= */
    if (cmd === 'neko') {
      const res = await axios.get('https://api.waifu.pics/sfw/neko')
      return sock.sendMessage(
        from,
        {
          image: { url: res.data.url },
          caption: '🐱 Neko'
        },
        { quoted: msg }
      )
    }

    /* ================= ANIME QUOTE ================= */
    if (cmd === 'animequote') {
      const res = await axios.get('https://animechan.xyz/api/random')
      return reply(
        sock,
        from,
`🎬 *${res.data.anime}*
👤 ${res.data.character}

"${res.data.quote}"`,
        msg
      )
    }
  }
}
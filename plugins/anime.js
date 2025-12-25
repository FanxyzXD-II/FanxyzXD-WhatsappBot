const axios = require('axios')

module.exports = {
  command: [
    'animemenu',
    'anime',
    'waifu',
    'neko',
    'animequote'
  ],

  run: async ({ sock, msg, from, args, config }) => {
    // Mendapatkan perintah tanpa prefix
    const body =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      msg.message.imageMessage?.caption ||
      ''
    const cmd = body.slice(config.prefix.length).trim().split(/ +/)[0].toLowerCase()

    try {
      /* ================= MENU ================= */
      if (cmd === 'animemenu') {
        const menuText = `🎌 *ANIME MENU*

• ${config.prefix}anime → Random anime image
• ${config.prefix}waifu → Random waifu
• ${config.prefix}neko → Random neko
• ${config.prefix}animequote → Random anime quote`
        
        return sock.sendMessage(from, { text: menuText }, { quoted: msg })
      }

      /* ================= RANDOM IMAGE (WAIFU/NEKO) ================= */
      if (['anime', 'waifu', 'neko'].includes(cmd)) {
        // Kirim reaksi sedang memproses
        await sock.sendMessage(from, { react: { text: '⏳', key: msg.key } })
        
        const type = cmd === 'neko' ? 'neko' : 'waifu'
        const res = await axios.get(`https://api.waifu.pics/sfw/${type}`)
        
        const captions = {
          anime: '🎌 Random Anime Image',
          waifu: '💖 Here is your Waifu',
          neko: '🐱 Meow! Random Neko'
        }

        return sock.sendMessage(
          from,
          {
            image: { url: res.data.url },
            caption: captions[cmd]
          },
          { quoted: msg }
        )
      }

      /* ================= ANIME QUOTE ================= */
      if (cmd === 'animequote') {
        await sock.sendMessage(from, { react: { text: '✍️', key: msg.key } })
        
        // Menggunakan API Animechan (Backup API jika yang utama down)
        const res = await axios.get('https://animechan.xyz/api/random').catch(() => null)
        
        if (!res) {
          return sock.sendMessage(from, { text: '❌ Gagal mengambil kutipan, coba lagi nanti.' }, { quoted: msg })
        }

        const quoteText = `🎬 *Anime:* ${res.data.anime}\n👤 *Char:* ${res.data.character}\n\n"${res.data.quote}"`
        
        return sock.sendMessage(from, { text: quoteText }, { quoted: msg })
      }

    } catch (error) {
      console.error('Error in anime plugin:', error)
      return sock.sendMessage(from, { text: '❌ Terjadi kesalahan pada server API.' }, { quoted: msg })
    }
  }
}

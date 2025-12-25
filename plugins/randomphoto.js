const axios = require('axios')

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

  run: async ({ sock, msg, from, config }) => {
    const body =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      msg.message.imageMessage?.caption ||
      ''

    const p = config.prefix
    const cmd = body.slice(p.length).trim().split(/ +/)[0].toLowerCase()

    /* ================= MENU ================= */
    if (cmd === 'randomphoto' || cmd === 'photomenu') {
      const menuText = `📸 *RANDOM PHOTO MENU*

• *${p}animepic* → Foto anime random
• *${p}cewek* → Foto cewek random
• *${p}cowok* → Foto cowok random
• *${p}kucing* → Foto kucing lucu
• *${p}meme* → Meme random (Reddit)`

      return sock.sendMessage(from, { text: menuText }, { quoted: msg })
    }

    try {
      // Kirim reaksi sedang memproses
      await sock.sendMessage(from, { react: { text: '⏳', key: msg.key } })

      let imageUrl = ''
      let caption = ''

      /* ================= LOGIC SELECTOR ================= */
      if (cmd === 'animepic') {
        const res = await axios.get(`https://api.lolhuman.xyz/api/random/anime?apikey=${config.lolkey || 'demo'}`)
        imageUrl = res.data.result
        caption = '🎌 *Random Anime Image*'
      } 
      
      else if (cmd === 'cewek') {
        const res = await axios.get(`https://api.lolhuman.xyz/api/random/cewek?apikey=${config.lolkey || 'demo'}`)
        imageUrl = res.data.result
        caption = '👧 *Random Girl Image*'
      } 
      
      else if (cmd === 'cowok') {
        const res = await axios.get(`https://api.lolhuman.xyz/api/random/cowok?apikey=${config.lolkey || 'demo'}`)
        imageUrl = res.data.result
        caption = '👦 *Random Boy Image*'
      } 
      
      else if (cmd === 'kucing') {
        const res = await axios.get('https://api.thecatapi.com/v1/images/search')
        imageUrl = res.data[0].url
        caption = '🐱 *Meow! Kucing Random*'
      } 
      
      else if (cmd === 'meme') {
        const res = await axios.get('https://meme-api.com/gimme')
        imageUrl = res.data.url
        caption = `😂 *Meme: ${res.data.title}*`
      }

      // Kirim Gambar
      if (imageUrl) {
        await sock.sendMessage(
          from,
          {
            image: { url: imageUrl },
            caption: caption
          },
          { quoted: msg }
        )
        // Reaksi berhasil
        await sock.sendMessage(from, { react: { text: '📸', key: msg.key } })
      }

    } catch (e) {
      console.error('Error RandomPhoto:', e)
      await sock.sendMessage(from, { react: { text: '❌', key: msg.key } })
      return sock.sendMessage(from, { text: '❌ Gagal mengambil foto. API mungkin sedang down atau limit.' }, { quoted: msg })
    }
  }
}

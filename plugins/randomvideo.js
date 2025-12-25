const axios = require('axios')

module.exports = {
  command: [
    'randomvideo',
    'videomenu',
    'asupan',
    'tiktokrandom',
    'animevideo',
    'memvideo'
  ],

  run: async ({ sock, msg, from, config }) => {
    // Mengambil teks dari berbagai tipe pesan (teks, caption foto/video)
    const body =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      msg.message.imageMessage?.caption ||
      msg.message.videoMessage?.caption ||
      ''

    const p = config.prefix
    const cmd = body.slice(p.length).trim().split(/ +/)[0].toLowerCase()

    /* ================= MENU ================= */
    if (cmd === 'videomenu' || cmd === 'randomvideo') {
      const menuText = `🎥 *RANDOM VIDEO MENU*

• *${p}asupan* → Video asupan random
• *${p}tiktokrandom* → Video TikTok random
• *${p}animevideo* → Video edit anime random
• *${p}memvideo* → Video meme random`

      return sock.sendMessage(from, { text: menuText }, { quoted: msg })
    }

    try {
      // Kirim reaksi sedang memproses
      await sock.sendMessage(from, { react: { text: '⏳', key: msg.key } })

      let videoUrl = ''
      let caption = ''
      const apiKey = config.lolkey || 'demo'

      /* ================= LOGIC SELECTOR ================= */
      if (cmd === 'asupan') {
        const res = await axios.get(`https://api.lolhuman.xyz/api/random/asupan?apikey=${apiKey}`)
        videoUrl = res.data.result
        caption = '🎵 *Asupan Random*'
      } 
      
      else if (cmd === 'tiktokrandom') {
        const res = await axios.get(`https://api.lolhuman.xyz/api/random/tiktok?apikey=${apiKey}`)
        videoUrl = res.data.result
        caption = '🎶 *TikTok Random*'
      } 
      
      else if (cmd === 'animevideo') {
        const res = await axios.get(`https://api.lolhuman.xyz/api/random/animevideo?apikey=${apiKey}`)
        videoUrl = res.data.result
        caption = '🎌 *Anime Edit Random*'
      } 
      
      else if (cmd === 'memvideo') {
        const res = await axios.get(`https://api.lolhuman.xyz/api/random/memevideo?apikey=${apiKey}`)
        videoUrl = res.data.result
        caption = '😂 *Meme Video Random*'
      }

      // Kirim Video ke User
      if (videoUrl) {
        await sock.sendMessage(
          from,
          {
            video: { url: videoUrl },
            caption: caption
          },
          { quoted: msg }
        )
        
        // Kirim reaksi berhasil
        await sock.sendMessage(from, { react: { text: '🎥', key: msg.key } })
      }

    } catch (e) {
      console.error('Error RandomVideo:', e)
      await sock.sendMessage(from, { react: { text: '❌', key: msg.key } })
      return sock.sendMessage(from, { text: '❌ Gagal mengambil video. Pastikan API Key valid atau coba lagi nanti.' }, { quoted: msg })
    }
  }
}

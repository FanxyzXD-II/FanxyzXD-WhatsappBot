const axios = require('axios')

module.exports = {
  command: [
    'downloadmenu',
    'ytmp3',
    'ytmp4',
    'tiktok',
    'ig',
    'igdl'
  ],

  run: async ({ sock, msg, from, args, config }) => {
    const body =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      ''

    const cmd = body.slice(config.prefix.length).trim().split(/ +/)[0].toLowerCase()
    const url = args[0]

    /* ================= MENU ================= */
    if (cmd === 'downloadmenu') {
      const menuText = `⬇️ *DOWNLOADER MENU*

• *${config.prefix}ytmp3* <link>
• *${config.prefix}ytmp4* <link>
• *${config.prefix}tiktok* <link>
• *${config.prefix}ig* <link>`
      
      return sock.sendMessage(from, { text: menuText }, { quoted: msg })
    }

    // Validasi Link
    if (!url) {
      return sock.sendMessage(from, { text: `⚠️ Masukkan link media! \nContoh: *${config.prefix}${cmd} https://...*` }, { quoted: msg })
    }

    try {
      /* ================= YTMP3 & YTMP4 ================= */
      if (cmd === 'ytmp3' || cmd === 'ytmp4') {
        await sock.sendMessage(from, { react: { text: '⏳', key: msg.key } })
        
        // Menggunakan API pihak ketiga yang lebih stabil daripada ytdl-core lokal
        const apiRes = await axios.get(`https://api.dhamzxploit.my.id/api/ytv?url=${url}`)
        if (!apiRes.data || apiRes.data.status !== true) throw new Error('API Fail')

        const data = apiRes.data.result
        if (cmd === 'ytmp3') {
          await sock.sendMessage(from, {
            audio: { url: data.mp3 },
            mimetype: 'audio/mpeg',
            fileName: `${data.title}.mp3`
          }, { quoted: msg })
        } else {
          await sock.sendMessage(from, {
            video: { url: data.mp4 },
            caption: `🎬 *Title:* ${data.title}\n📺 *Quality:* 360p`
          }, { quoted: msg })
        }
        return await sock.sendMessage(from, { react: { text: '✅', key: msg.key } })
      }

      /* ================= TIKTOK ================= */
      if (cmd === 'tiktok') {
        await sock.sendMessage(from, { react: { text: '🎶', key: msg.key } })
        
        const res = await axios.get(`https://tikwm.com/api/?url=${encodeURIComponent(url)}`)
        const data = res.data.data

        if (!data) return sock.sendMessage(from, { text: '❌ Video tidak ditemukan atau link tidak valid.' })

        await sock.sendMessage(from, {
          video: { url: data.play },
          caption: `🎵 *TikTok:* ${data.title || 'No Caption'}\n👤 *Author:* ${data.author.nickname}`
        }, { quoted: msg })
        return await sock.sendMessage(from, { react: { text: '✅', key: msg.key } })
      }

      /* ================= INSTAGRAM ================= */
      if (cmd === 'ig' || cmd === 'igdl') {
        await sock.sendMessage(from, { react: { text: '📸', key: msg.key } })
        
        // Menggunakan API publik yang mendukung Reels & Video
        const res = await axios.get(`https://api.dhamzxploit.my.id/api/igdl?url=${url}`)
        if (!res.data.result) throw new Error('Invalid Result')

        const results = res.data.result
        for (let i = 0; i < Math.min(results.length, 2); i++) { // Limit kirim max 2 file jika slide
           await sock.sendMessage(from, { 
             video: { url: results[i].url },
             caption: `📸 Instagram Downloader`
           }, { quoted: msg })
        }
        return await sock.sendMessage(from, { react: { text: '✅', key: msg.key } })
      }

    } catch (e) {
      console.error(e)
      await sock.sendMessage(from, { react: { text: '❌', key: msg.key } })
      return sock.sendMessage(from, { text: '❌ Terjadi kesalahan atau link tidak didukung.' }, { quoted: msg })
    }
  }
}

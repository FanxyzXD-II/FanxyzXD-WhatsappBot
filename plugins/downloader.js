const axios = require('axios')
const ytdl = require('ytdl-core')
const { reply } = require('../lib/util')

module.exports = {
  command: [
    'downloadmenu',
    'ytmp3',
    'ytmp4',
    'tiktok',
    'ig'
  ],

  run: async ({ sock, msg, from, args }) => {
    const body =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      ''

    const cmd = body.slice(1).split(' ')[0].toLowerCase()
    const url = args[0]

    /* ================= MENU ================= */
    if (cmd === 'downloadmenu') {
      return reply(
        sock,
        from,
`⬇️ *DOWNLOADER MENU*

• .ytmp3 <link>
• .ytmp4 <link>
• .tiktok <link>
• .ig <link>`,
        msg
      )
    }

    if (!url) {
      return reply(sock, from, '❗ Masukkan link', msg)
    }

    /* ================= YTMP3 ================= */
    if (cmd === 'ytmp3') {
      if (!ytdl.validateURL(url))
        return reply(sock, from, '❌ Link YouTube tidak valid', msg)

      reply(sock, from, '⏳ Download audio...', msg)

      const info = await ytdl.getInfo(url)
      const title = info.videoDetails.title

      const stream = ytdl(url, {
        filter: 'audioonly',
        quality: 'highestaudio'
      })

      await sock.sendMessage(
        from,
        {
          audio: { stream },
          mimetype: 'audio/mpeg',
          ptt: false,
          fileName: `${title}.mp3`
        },
        { quoted: msg }
      )
    }

    /* ================= YTMP4 ================= */
    if (cmd === 'ytmp4') {
      if (!ytdl.validateURL(url))
        return reply(sock, from, '❌ Link YouTube tidak valid', msg)

      reply(sock, from, '⏳ Download video...', msg)

      const stream = ytdl(url, {
        filter: 'videoandaudio',
        quality: '18'
      })

      await sock.sendMessage(
        from,
        {
          video: { stream },
          caption: '🎬 YouTube MP4'
        },
        { quoted: msg }
      )
    }

    /* ================= TIKTOK ================= */
    if (cmd === 'tiktok') {
      reply(sock, from, '⏳ Download TikTok...', msg)

      const res = await axios.get(
        `https://tikwm.com/api/?url=${encodeURIComponent(url)}`
      )

      if (!res.data || !res.data.data) {
        return reply(sock, from, '❌ Gagal download TikTok', msg)
      }

      await sock.sendMessage(
        from,
        {
          video: { url: res.data.data.play },
          caption: '🎵 TikTok Downloader'
        },
        { quoted: msg }
      )
    }

    /* ================= INSTAGRAM ================= */
    if (cmd === 'ig') {
      reply(sock, from, '⏳ Download Instagram...', msg)

      const res = await axios.get(
        `https://api.lolhuman.xyz/api/instagram?apikey=demo&url=${url}`
      )

      if (!res.data || !res.data.result) {
        return reply(sock, from, '❌ Gagal download IG', msg)
      }

      await sock.sendMessage(
        from,
        {
          video: { url: res.data.result[0] },
          caption: '📸 Instagram Downloader'
        },
        { quoted: msg }
      )
    }
  }
}
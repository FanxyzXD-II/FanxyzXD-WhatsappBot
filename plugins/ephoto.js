const axios = require('axios')

// Daftar template yang didukung
const templates = {
  neon: 'https://ephoto360.com/neon-text-effect-online-879.html',
  glitch: 'https://ephoto360.com/create-digital-glitch-text-effects-online-767.html',
  blackpink: 'https://ephoto360.com/blackpink-style-logo-maker-online-710.html',
  gaming: 'https://ephoto360.com/free-gaming-logo-maker-online-564.html',
  silver: 'https://ephoto360.com/silver-text-effect-372.html'
}

module.exports = {
  // Command otomatis mengambil dari key templates + menu utama
  command: ['ephoto', 'ephotomenu', ...Object.keys(templates)],

  run: async ({ sock, msg, from, args, config }) => {
    const body =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      msg.message.imageMessage?.caption ||
      ''

    // Mengambil command tanpa prefix
    const cmd = body.slice(config.prefix.length).trim().split(/ +/)[0].toLowerCase()
    const text = args.join(' ')

    /* ================= MENU ================= */
    if (cmd === 'ephotomenu' || cmd === 'ephoto') {
      let menuText = '🖼️ *EPHOTO MENU*\n\n'
      for (let t in templates) {
        menuText += `• *${config.prefix}${t}* <teks>\n`
      }
      menuText += `\n_Contoh: ${config.prefix}neon FanxyzXD_`
      return sock.sendMessage(from, { text: menuText }, { quoted: msg })
    }

    /* ================= VALIDASI & EKSEKUSI ================= */
    if (templates[cmd]) {
      if (!text) {
        return sock.sendMessage(
          from, 
          { text: `⚠️ Masukkan teks yang ingin dibuat!\nContoh: *${config.prefix}${cmd} FanxyzXD*` }, 
          { quoted: msg }
        )
      }

      try {
        // Kirim reaksi sedang diproses
        await sock.sendMessage(from, { react: { text: '⏳', key: msg.key } })

        // Menggunakan API (Pastikan API Key valid, 'demo' biasanya memiliki limit)
        const apiUrl = `https://api.lolhuman.xyz/api/ephoto360/${cmd}?apikey=${config.lolkey || 'demo'}&text=${encodeURIComponent(text)}`
        
        // Catatan: Jika endpoint di atas tidak bekerja, gunakan fallback url template:
        // const apiUrl = `https://api.lolhuman.xyz/api/ephoto?apikey=demo&url=${encodeURIComponent(templates[cmd])}&text=${encodeURIComponent(text)}`

        const res = await axios.get(apiUrl)

        if (!res.data || !res.data.result) {
            throw new Error('Invalid API Response')
        }

        await sock.sendMessage(
          from,
          {
            image: { url: res.data.result },
            caption: `✨ *EPHOTO RESULT*\n🎨 *Style:* ${cmd.toUpperCase()}\n📝 *Teks:* ${text}`
          },
          { quoted: msg }
        )

        // Kirim reaksi sukses
        await sock.sendMessage(from, { react: { text: '✅', key: msg.key } })

      } catch (e) {
        console.error('Ephoto Error:', e)
        await sock.sendMessage(from, { react: { text: '❌', key: msg.key } })
        return sock.sendMessage(from, { text: '❌ Gagal membuat gambar. API sedang sibuk atau limit.' }, { quoted: msg })
      }
    }
  }
}

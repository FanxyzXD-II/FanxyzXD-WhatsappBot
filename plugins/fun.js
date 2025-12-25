const axios = require('axios')

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

module.exports = {
  command: [
    'funmenu',
    'jodoh',
    'rate',
    'truth',
    'dare',
    'cekbucin',
    'faktaunik',
    'quotes'
  ],

  run: async ({ sock, msg, from, args, config }) => {
    const body =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      msg.message.imageMessage?.caption ||
      ''

    const cmd = body.slice(config.prefix.length).trim().split(/ +/)[0].toLowerCase()

    try {
      /* ================= MENU ================= */
      if (cmd === 'funmenu') {
        const menuText = `🎉 *FUN MENU*

• *${config.prefix}jodoh* @tag
• *${config.prefix}rate* <nama/sesuatu>
• *${config.prefix}truth*
• *${config.prefix}dare*
• *${config.prefix}cekbucin*
• *${config.prefix}faktaunik*
• *${config.prefix}quotes*`
        
        return sock.sendMessage(from, { text: menuText }, { quoted: msg })
      }

      /* ================= JODOH ================= */
      if (cmd === 'jodoh') {
        const mentioned = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || []
        if (mentioned.length === 0) {
          return sock.sendMessage(from, { text: `❗ Tag orang yang ingin dicek kecocokannya!\nContoh: *${config.prefix}jodoh @user*` }, { quoted: msg })
        }

        await sock.sendMessage(from, { react: { text: '💘', key: msg.key } })
        const persen = Math.floor(Math.random() * 100) + 1
        const caption = `💘 *JODOH CHECK*\n\nTarget: @${mentioned[0].split('@')[0]}\nKecocokan: *${persen}%*\n\n${persen > 75 ? '🔥 Wah, kalian cocok banget!' : persen > 40 ? '😅 Lumayan lah, perlu usaha dikit.' : '💔 Mending cari yang lain saja.'}`
        
        return sock.sendMessage(from, { text: caption, mentions: [mentioned[0]] }, { quoted: msg })
      }

      /* ================= RATE ================= */
      if (cmd === 'rate') {
        if (!args[0]) return sock.sendMessage(from, { text: '❗ Apa yang mau di-rate?' }, { quoted: msg })
        
        const nilai = Math.floor(Math.random() * 100) + 1
        return sock.sendMessage(from, { text: `⭐ *RATE CHECK*\n\n*Objek:* ${args.join(' ')}\n*Nilai:* ${nilai}/100` }, { quoted: msg })
      }

      /* ================= TRUTH ================= */
      if (cmd === 'truth') {
        const truths = [
          'Siapa orang terakhir yang kamu stalk di sosmed?',
          'Pernah suka sama teman satu grup ini?',
          'Apa rahasia paling memalukan yang belum pernah kamu ceritakan?',
          'Kapan terakhir kali kamu menangis dan karena apa?',
          'Pernah selingkuh atau diselingkuhi?',
          'Siapa orang yang paling ingin kamu hapus dari ingatan?'
        ]
        return sock.sendMessage(from, { text: `🧠 *TRUTH*\n\n"${pick(truths)}"` }, { quoted: msg })
      }

      /* ================= DARE ================= */
      if (cmd === 'dare') {
        const dares = [
          'Kirim VN bilang "I love you" ke mantan atau crush.',
          'SS chat terakhir di WA kamu lalu kirim ke sini.',
          'Ganti info/bio WA kamu jadi "Aku adalah beban keluarga" selama 1 jam.',
          'Kirim foto selfie paling konyol sekarang juga.',
          'Kirim pesan ke kontak ke-5 di WA kamu, bilang "Aku sayang kamu".',
          'Diam jangan chat di grup ini selama 15 menit.'
        ]
        return sock.sendMessage(from, { text: `🔥 *DARE*\n\n"${pick(dares)}"` }, { quoted: msg })
      }

      /* ================= CEK BUCIN ================= */
      if (cmd === 'cekbucin') {
        const persen = Math.floor(Math.random() * 100) + 1
        let comment = persen > 80 ? '🚨 Parah! Level bucin akut.' : persen > 50 ? '😌 Lumayan bucin ya.' : '😎 Aman, hati masih dingin.'
        return sock.sendMessage(from, { text: `💔 *CEK BUCIN*\n\nLevel: *${persen}%*\nStatus: ${comment}` }, { quoted: msg })
      }

      /* ================= FAKTA UNIK ================= */
      if (cmd === 'faktaunik') {
        const fakta = [
          'Otak manusia lebih aktif saat tidur daripada saat menonton TV.',
          'Madu adalah satu-satunya makanan yang tidak bisa basi.',
          'Kecoa bisa hidup beberapa minggu tanpa kepala sebelum mati kelaparan.',
          'Semut tidak punya paru-paru dan tidak pernah tidur.',
          'Warna asli wortel dulunya adalah ungu, bukan oranye.'
        ]
        return sock.sendMessage(from, { text: `📚 *FAKTA UNIK*\n\n${pick(fakta)}` }, { quoted: msg })
      }

      /* ================= QUOTES ================= */
      if (cmd === 'quotes') {
        await sock.sendMessage(from, { react: { text: '💬', key: msg.key } })
        try {
          // Menggunakan API Quotable atau fallback
          const res = await axios.get('https://api.quotable.io/random').catch(() => null)
          if (res) {
            return sock.sendMessage(from, { text: `💬 *QUOTES*\n\n"${res.data.content}"\n\n— _${res.data.author}_` }, { quoted: msg })
          } else {
            const localQuotes = [
              'Hargai proses, karena hasil tidak pernah instan.',
              'Jangan berhenti saat lelah, berhentilah saat selesai.',
              'Kegagalan adalah bumbu yang memberi rasa pada kesuksesan.'
            ]
            return sock.sendMessage(from, { text: `💬 *QUOTES*\n\n"${pick(localQuotes)}"` }, { quoted: msg })
          }
        } catch (e) {
          console.error(e)
        }
      }

    } catch (error) {
      console.error('Error in fun plugin:', error)
    }
  }
}

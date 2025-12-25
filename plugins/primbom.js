// Helper untuk mengambil item acak dari array
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)]

module.exports = {
  command: [
    'primbom',
    'primbommenu',
    'artinama',
    'jodohnama',
    'rezeki',
    'haribaik',
    'weton'
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
      if (cmd === 'primbom' || cmd === 'primbommenu') {
        const menuText = `🔮 *PRIMBON JAWA MODERN* 🔮

• *${config.prefix}artinama* <nama>
• *${config.prefix}jodohnama* <nama1>|<nama2>
• *${config.prefix}rezeki* <nama>
• *${config.prefix}haribaik*
• *${config.prefix}weton* <hari lahir>

_Contoh: ${config.prefix}jodohnama Adi|Santi_`
        
        return sock.sendMessage(from, { text: menuText }, { quoted: msg })
      }

      /* ================= ARTI NAMA ================= */
      if (cmd === 'artinama') {
        if (!args[0]) return sock.sendMessage(from, { text: `❗ Masukkan nama!\nContoh: *${config.prefix}artinama Budi*` }, { quoted: msg })

        await sock.sendMessage(from, { react: { text: '📖', key: msg.key } })
        const arti = [
          'pembawa keberuntungan dan rezeki bagi keluarga',
          'berjiwa pemimpin yang kuat dan disegani',
          'berhati lembut dan sangat penyayang',
          'sosok cerdas, kreatif, dan penuh inovasi',
          'memiliki kharisma tinggi dan daya tarik alami',
          'orang yang sangat setia, jujur, dan dapat dipercaya',
          'memiliki intuisi tajam dan sulit dibohongi'
        ]

        return sock.sendMessage(from, { 
          text: `📖 *ARTI NAMA (RAMALAN)*\n\n*Nama:* ${args.join(' ')}\n*Makna:* Sosok yang ${rand(arti)}.` 
        }, { quoted: msg })
      }

      /* ================= JODOH NAMA ================= */
      if (cmd === 'jodohnama') {
        const text = args.join(' ')
        if (!text.includes('|')) {
          return sock.sendMessage(from, { text: `❗ Gunakan tanda pemisah |\nContoh: *${config.prefix}jodohnama Adi|Santi*` }, { quoted: msg })
        }

        await sock.sendMessage(from, { react: { text: '💞', key: msg.key } })
        const [a, b] = text.split('|').map(v => v.trim())
        const persen = Math.floor(Math.random() * 100) + 1
        const status = persen > 80 ? '✨ Sangat Serasi!' : persen > 50 ? '⚖️ Cukup Harmonis.' : '😅 Perlu Banyak Komunikasi.'

        return sock.sendMessage(from, { 
          text: `💞 *KECOCOKAN JODOH*\n\n*Pasangan:* ${a} ❤️ ${b}\n*Persentase:* ${persen}%\n*Ramalan:* ${status}` 
        }, { quoted: msg })
      }

      /* ================= REZEKI ================= */
      if (cmd === 'rezeki') {
        if (!args[0]) return sock.sendMessage(from, { text: '❗ Masukkan nama untuk dicek rezekinya.' }, { quoted: msg })

        await sock.sendMessage(from, { react: { text: '💰', key: msg.key } })
        const rezeki = [
          'rezeki mengalir deras seperti air',
          'rezeki stabil dan cenderung meningkat',
          'rezeki akan besar di usia matang (30-40 thn)',
          'rezeki datang dari usaha keras yang konsisten',
          'rezeki tak terduga sering menghampiri Anda',
          'rezeki kuat namun harus hati-hati dalam pengeluaran'
        ]

        return sock.sendMessage(from, { 
          text: `💰 *RAMALAN REZEKI*\n\n*Nama:* ${args.join(' ')}\n*Hasil:* ${rand(rezeki)}.` 
        }, { quoted: msg })
      }

      /* ================= HARI BAIK ================= */
      if (cmd === 'haribaik') {
        await sock.sendMessage(from, { react: { text: '📅', key: msg.key } })
        const hari = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']
        const kegiatan = ['memulai usaha', 'bepergian jauh', 'mengadakan acara', 'membeli barang berharga', 'mencari relasi']

        return sock.sendMessage(from, { 
          text: `📅 *HARI BAIK ANDA*\n\nHari baik Anda minggu ini adalah:\n👉 *${rand(hari)}*\n\nCocok untuk: _${rand(kegiatan)}_` 
        }, { quoted: msg })
      }

      /* ================= WETON ================= */
      if (cmd === 'weton') {
        if (!args[0]) return sock.sendMessage(from, { text: `❗ Masukkan hari lahir!\nContoh: *${config.prefix}weton senin*` }, { quoted: msg })

        await sock.sendMessage(from, { react: { text: '🌙', key: msg.key } })
        const watak = [
          'pekerja keras dan ulet',
          'mudah bergaul dan banyak kawan',
          'pendiam namun memiliki pemikiran bijak',
          'sedikit emosional namun pemberani',
          'berwibawa dan suka menolong',
          'berani mengambil risiko besar',
          'cerdas dan pandai menyimpan rahasia'
        ]

        return sock.sendMessage(from, { 
          text: `🌙 *WETON & WATAK*\n\n*Hari Lahir:* ${args[0].charAt(0).toUpperCase() + args[0].slice(1)}\n*Sifat Utama:* ${rand(watak)}.` 
        }, { quoted: msg })
      }

    } catch (e) {
      console.error('Primbom Error:', e)
      await sock.sendMessage(from, { text: '❌ Terjadi kesalahan dalam meramal.' }, { quoted: msg })
    }
  }
}

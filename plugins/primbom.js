const { reply } = require('../lib/util')

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

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

  run: async ({ sock, msg, from, args }) => {
    const body =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      ''

    const cmd = body.slice(1).split(' ')[0].toLowerCase()

    /* ================= MENU ================= */
    if (cmd === 'primbom' || cmd === 'primbommenu') {
      return reply(
        sock,
        from,
`🔮 *PRIMBOM MENU*

• .artinama <nama>
• .jodohnama <nama1>|<nama2>
• .rezeki <nama>
• .haribaik
• .weton <hari lahir>`,
        msg
      )
    }

    /* ================= ARTI NAMA ================= */
    if (cmd === 'artinama') {
      if (!args[0]) return reply(sock, from, '❗ Masukkan nama', msg)

      const arti = [
        'pembawa keberuntungan',
        'berjiwa pemimpin',
        'berhati lembut',
        'cerdas dan kreatif',
        'penuh kharisma',
        'setia dan jujur'
      ]

      return reply(
        sock,
        from,
`📖 *ARTI NAMA*

Nama: ${args.join(' ')}
Makna: Orang yang ${rand(arti)}`,
        msg
      )
    }

    /* ================= JODOH NAMA ================= */
    if (cmd === 'jodohnama') {
      const text = args.join(' ')
      if (!text.includes('|'))
        return reply(
          sock,
          from,
          '❗ Format:\n.jodohnama nama1|nama2',
          msg
        )

      const [a, b] = text.split('|')
      const persen = Math.floor(Math.random() * 100) + 1

      return reply(
        sock,
        from,
`💞 *JODOH NAMA*

${a.trim()} ❤️ ${b.trim()}
Kecocokan: ${persen}%
${persen > 70 ? '✨ Cocok!' : '😅 Perlu usaha'}`,
        msg
      )
    }

    /* ================= REZEKI ================= */
    if (cmd === 'rezeki') {
      if (!args[0]) return reply(sock, from, '❗ Masukkan nama', msg)

      const rezeki = [
        'rezeki lancar',
        'rezeki naik turun',
        'rezeki besar di usia matang',
        'rezeki datang dari usaha',
        'rezeki tak terduga'
      ]

      return reply(
        sock,
        from,
`💰 *PRIMBOM REZEKI*

Nama: ${args.join(' ')}
Ramalan: ${rand(rezeki)}`,
        msg
      )
    }

    /* ================= HARI BAIK ================= */
    if (cmd === 'haribaik') {
      const hari = [
        'Senin',
        'Selasa',
        'Rabu',
        'Kamis',
        'Jumat',
        'Sabtu',
        'Minggu'
      ]

      return reply(
        sock,
        from,
`📅 *HARI BAIK*

Hari baik kamu:
👉 ${rand(hari)}`,
        msg
      )
    }

    /* ================= WETON ================= */
    if (cmd === 'weton') {
      if (!args[0])
        return reply(sock, from, '❗ Contoh: .weton senin', msg)

      const watak = [
        'pekerja keras',
        'mudah bergaul',
        'pendiam tapi bijak',
        'emosional',
        'berwibawa',
        'berani ambil risiko'
      ]

      return reply(
        sock,
        from,
`🌙 *WETON JAWA*

Hari lahir: ${args[0]}
Watak: ${rand(watak)}`,
        msg
      )
    }
  }
}
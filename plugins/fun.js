const axios = require('axios')
const { reply } = require('../lib/util')

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

  run: async ({ sock, msg, from, args }) => {
    const body =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      ''

    const cmd = body.slice(1).split(' ')[0].toLowerCase()
    const sender = msg.key.participant || msg.key.remoteJid

    /* ================= MENU ================= */
    if (cmd === 'funmenu') {
      return reply(
        sock,
        from,
`🎉 *FUN MENU*

• .jodoh @tag
• .rate nama
• .truth
• .dare
• .cekbucin
• .faktaunik
• .quotes`,
        msg
      )
    }

    /* ================= JODOH ================= */
    if (cmd === 'jodoh') {
      const tag =
        msg.message.extendedTextMessage?.contextInfo?.mentionedJid
      if (!tag || !tag[0]) {
        return reply(sock, from, '❗ Tag seseorang', msg)
      }

      const persen = Math.floor(Math.random() * 100) + 1
      return reply(
        sock,
        from,
`💘 *JODOH CHECK*

Kecocokan: ${persen}%
${persen > 70 ? '🔥 Cocok banget!' : '😅 Perlu usaha'}`,
        msg
      )
    }

    /* ================= RATE ================= */
    if (cmd === 'rate') {
      if (!args[0]) return reply(sock, from, '❗ Masukkan nama', msg)
      const nilai = Math.floor(Math.random() * 100) + 1
      return reply(
        sock,
        from,
`⭐ *RATE*

Nama: ${args.join(' ')}
Nilai: ${nilai}/100`,
        msg
      )
    }

    /* ================= TRUTH ================= */
    if (cmd === 'truth') {
      const truths = [
        'Siapa orang terakhir yang kamu stalk?',
        'Pernah suka sama teman sendiri?',
        'Rahasia terbesar kamu apa?',
        'Pernah bohong ke orang tua?',
        'Siapa crush kamu sekarang?'
      ]
      return reply(sock, from, `🧠 *TRUTH*\n${pick(truths)}`, msg)
    }

    /* ================= DARE ================= */
    if (cmd === 'dare') {
      const dares = [
        'Kirim voice bilang "Aku bot WA"',
        'Ganti nama WA kamu selama 10 menit',
        'Tag orang yang paling sering kamu chat',
        'Kirim emoji favorit kamu 10x',
        'Kirim stiker random'
      ]
      return reply(sock, from, `🔥 *DARE*\n${pick(dares)}`, msg)
    }

    /* ================= CEK BUCIN ================= */
    if (cmd === 'cekbucin') {
      const persen = Math.floor(Math.random() * 100) + 1
      return reply(
        sock,
        from,
`💔 *CEK BUCIN*

Level bucin kamu: ${persen}%
${persen > 80 ? '🚨 Parah bucin!' : '😌 Masih aman'}`,
        msg
      )
    }

    /* ================= FAKTA UNIK ================= */
    if (cmd === 'faktaunik') {
      const fakta = [
        'Otak manusia lebih aktif saat malam hari.',
        'Madu tidak pernah basi.',
        'Gurita punya 3 jantung.',
        'Pisang itu buah berry.',
        'Jantung udang ada di kepalanya.'
      ]
      return reply(sock, from, `📚 *FAKTA UNIK*\n${pick(fakta)}`, msg)
    }

    /* ================= QUOTES ================= */
    if (cmd === 'quotes') {
      try {
        const res = await axios.get('https://api.quotable.io/random')
        return reply(
          sock,
          from,
`💬 *QUOTES*

"${res.data.content}"
— ${res.data.author}`,
          msg
        )
      } catch {
        return reply(sock, from, '❌ Gagal ambil quotes', msg)
      }
    }
  }
}
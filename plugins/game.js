const { reply } = require('../lib/util')

// penyimpanan skor sementara (RAM)
const score = {}

function getUser(jid) {
  if (!score[jid]) score[jid] = { tebak: 0 }
  return score[jid]
}

module.exports = {
  command: [
    'gamemenu',
    'tebakangka',
    'tebak'
  ],

  run: async ({ sock, msg, from, args }) => {
    const body =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      ''

    const sender = msg.key.participant || msg.key.remoteJid
    const cmd = body.slice(1).split(' ')[0].toLowerCase()

    /* ================= GAME MENU ================= */
    if (cmd === 'gamemenu') {
      return reply(
        sock,
        from,
`🎮 *GAME MENU*

• .tebakangka → tebak angka 1-10
• .tebak <angka> → jawab tebakan`,
        msg
      )
    }

    /* ================= START GAME ================= */
    if (cmd === 'tebakangka') {
      const angka = Math.floor(Math.random() * 10) + 1
      score[sender] = {
        answer: angka,
        playing: true
      }

      return reply(
        sock,
        from,
        `🎲 Aku memikirkan angka *1–10*\nKetik: .tebak <angka>`,
        msg
      )
    }

    /* ================= JAWABAN ================= */
    if (cmd === 'tebak') {
      if (!score[sender] || !score[sender].playing) {
        return reply(
          sock,
          from,
          '❗ Kamu belum memulai game\nKetik .tebakangka',
          msg
        )
      }

      const jawaban = parseInt(args[0])
      if (!jawaban) {
        return reply(sock, from, '❗ Masukkan angka', msg)
      }

      if (jawaban === score[sender].answer) {
        score[sender].playing = false
        score[sender].tebak = (score[sender].tebak || 0) + 1

        return reply(
          sock,
          from,
          `🎉 *BENAR!*\nSkor kamu: ${score[sender].tebak}`,
          msg
        )
      } else {
        return reply(sock, from, '❌ Salah, coba lagi!', msg)
      }
    }
  }
}
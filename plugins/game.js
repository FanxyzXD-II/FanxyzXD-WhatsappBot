// Penyimpanan skor dan sesi game (RAM)
const db_score = {}
const sessions = {}

module.exports = {
  command: [
    'gamemenu',
    'tebakangka',
    'tebak',
    'skor'
  ],

  run: async ({ sock, msg, from, args, config }) => {
    const body =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      msg.message.imageMessage?.caption ||
      ''

    const sender = msg.key.participant || msg.key.remoteJid
    const cmd = body.slice(config.prefix.length).trim().split(/ +/)[0].toLowerCase()

    // Inisialisasi skor user jika belum ada
    if (!db_score[sender]) db_score[sender] = { point: 0, win: 0 }

    try {
      /* ================= GAME MENU ================= */
      if (cmd === 'gamemenu') {
        const menuText = `🎮 *GAME MENU*

• *${config.prefix}tebakangka* → Mulai game baru
• *${config.prefix}tebak <angka>* → Jawab tebakan
• *${config.prefix}skor* → Lihat poin kamu

_Cara main: Bot akan memikirkan angka 1-10, tugasmu adalah menebaknya dengan benar!_`
        
        return sock.sendMessage(from, { text: menuText }, { quoted: msg })
      }

      /* ================= LIHAT SKOR ================= */
      if (cmd === 'skor') {
        const user = db_score[sender]
        return sock.sendMessage(from, { 
          text: `🏆 *STATISTIK KAMU*\n\n👤 User: @${sender.split('@')[0]}\n💰 Poin: ${user.point}\n✅ Total Menang: ${user.win}`,
          mentions: [sender]
        }, { quoted: msg })
      }

      /* ================= START GAME ================= */
      if (cmd === 'tebakangka') {
        // Jika sudah ada sesi aktif
        if (sessions[sender]) {
          return sock.sendMessage(from, { text: `⚠️ Kamu masih punya sesi aktif!\nKetik *${config.prefix}tebak* untuk menjawab.` }, { quoted: msg })
        }

        const angkaRahasia = Math.floor(Math.random() * 10) + 1
        sessions[sender] = {
          answer: angkaRahasia,
          attempts: 0
        }

        await sock.sendMessage(from, { react: { text: '🎲', key: msg.key } })
        return sock.sendMessage(from, { 
          text: `🎲 Aku memikirkan angka antara *1 sampai 10*.\n\nBisa tebak angka berapa itu?\nKetik: *${config.prefix}tebak <angka>*` 
        }, { quoted: msg })
      }

      /* ================= JAWABAN ================= */
      if (cmd === 'tebak') {
        const session = sessions[sender]
        if (!session) {
          return sock.sendMessage(from, { text: `❌ Kamu belum memulai permainan.\nKetik *${config.prefix}tebakangka* untuk mulai.` }, { quoted: msg })
        }

        const input = parseInt(args[0])
        if (isNaN(input) || input < 1 || input > 10) {
          return sock.sendMessage(from, { text: '❗ Masukkan angka valid antara 1 - 10!' }, { quoted: msg })
        }

        session.attempts++

        if (input === session.answer) {
          // Menang
          const bonusPoin = 100
          db_score[sender].point += bonusPoin
          db_score[sender].win += 1
          
          const winMsg = `🎉 *CONGRATS!*\n\nAngka benar: *${session.answer}*\nPercobaan: ${session.attempts}x\n\n💰 Kamu mendapatkan *+${bonusPoin}* poin!\nTotal Poin: ${db_score[sender].point}`
          
          delete sessions[sender] // Hapus sesi setelah menang
          await sock.sendMessage(from, { react: { text: '🎊', key: msg.key } })
          return sock.sendMessage(from, { text: winMsg }, { quoted: msg })
        } else {
          // Salah (Beri Petunjuk)
          const hint = input < session.answer ? 'Lebih besar ⬆️' : 'Lebih kecil ⬇️'
          return sock.sendMessage(from, { text: `❌ Salah! Coba lagi.\n\nPetunjuk: *${hint}*` }, { quoted: msg })
        }
      }

    } catch (e) {
      console.error('Game Error:', e)
    }
  }
}

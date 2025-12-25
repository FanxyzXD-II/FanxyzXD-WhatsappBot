const { isAdmin } = require('../lib/util')

module.exports = {
  command: [
    'groupmenu',
    'add',
    'kick',
    'promote',
    'demote',
    'linkgc',
    'tagall',
    'hidetag',
    'setname',
    'setdesc',
    'leaderboard'
  ],

  run: async ({ sock, msg, from, args, isGroup, config }) => {
    // Validasi Dasar
    if (!isGroup) return sock.sendMessage(from, { text: '❗ Perintah ini hanya dapat digunakan di dalam grup.' }, { quoted: msg })

    const body =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      msg.message.imageMessage?.caption ||
      ''

    const cmd = body.slice(config.prefix.length).trim().split(/ +/)[0].toLowerCase()
    const sender = msg.key.participant || msg.key.remoteJid

    // Ambil Metadata Grup
    const metadata = await sock.groupMetadata(from)
    const participants = metadata.participants
    
    // Cek Izin (User Admin & Bot Admin)
    const userAdmin = participants.find(p => p.id === sender)?.admin
    const botAdmin = participants.find(p => p.id === sock.user.id.split(':')[0] + '@s.whatsapp.net')?.admin

    if (!userAdmin && cmd !== 'groupmenu' && cmd !== 'leaderboard') {
      return sock.sendMessage(from, { text: '⛔ Anda harus menjadi admin untuk menggunakan perintah ini.' }, { quoted: msg })
    }

    try {
      /* ================= GROUP MENU ================= */
      if (cmd === 'groupmenu') {
        const menuText = `👥 *GROUP MANAGER*

• *${config.prefix}add* 628xxx
• *${config.prefix}kick* @tag
• *${config.prefix}promote* @tag
• *${config.prefix}demote* @tag
• *${config.prefix}linkgc*
• *${config.prefix}tagall* <pesan>
• *${config.prefix}hidetag* <pesan>
• *${config.prefix}setname* <teks>
• *${config.prefix}setdesc* <teks>
• *${config.prefix}leaderboard*`
        
        return sock.sendMessage(from, { text: menuText }, { quoted: msg })
      }

      /* ================= LEADERBOARD (INTEGRASI GAME) ================= */
      if (cmd === 'leaderboard') {
        // Mengasumsikan db_score ada di global atau diimport. 
        // Jika menggunakan sistem file, ganti dengan pembacaan database Anda.
        const leaderboardText = `🏆 *TOP PLAYERS - ${metadata.subject}*\n\n_Fitur ini menampilkan pemain aktif di sesi ini._`
        return sock.sendMessage(from, { text: leaderboardText }, { quoted: msg })
      }

      // Perintah di bawah ini butuh bot menjadi admin
      if (!botAdmin) return sock.sendMessage(from, { text: '❌ Gagal. Bot harus menjadi admin grup untuk melakukan ini.' }, { quoted: msg })

      /* ================= ADD & KICK ================= */
      if (cmd === 'add') {
        if (!args[0]) return sock.sendMessage(from, { text: `❗ Masukkan nomor!\nContoh: *${config.prefix}add 628xxx*` })
        const num = args[0].replace(/\D/g, '') + '@s.whatsapp.net'
        await sock.groupParticipantsUpdate(from, [num], 'add')
        return sock.sendMessage(from, { react: { text: '✅', key: msg.key } })
      }

      if (cmd === 'kick') {
        const target = msg.message.extendedTextMessage?.contextInfo?.mentionedJid
        if (!target || target.length === 0) return sock.sendMessage(from, { text: '❗ Tag member yang ingin dikeluarkan.' })
        await sock.groupParticipantsUpdate(from, target, 'remove')
        return sock.sendMessage(from, { react: { text: '🗑️', key: msg.key } })
      }

      /* ================= PROMOTE & DEMOTE ================= */
      if (cmd === 'promote' || cmd === 'demote') {
        const target = msg.message.extendedTextMessage?.contextInfo?.mentionedJid
        if (!target || target.length === 0) return sock.sendMessage(from, { text: '❗ Tag membernya.' })
        await sock.groupParticipantsUpdate(from, target, cmd)
        return sock.sendMessage(from, { react: { text: '⚡', key: msg.key } })
      }

      /* ================= TAG ALL & HIDETAG ================= */
      if (cmd === 'tagall' || cmd === 'hidetag') {
        const members = participants.map(p => p.id)
        const message = args.join(' ') || 'Tanpa Pesan'
        
        if (cmd === 'tagall') {
          let teks = `📣 *TAG ALL*\n\n*Pesan:* ${message}\n\n`
          for (let mem of members) {
            teks += `🔹 @${mem.split('@')[0]}\n`
          }
          return sock.sendMessage(from, { text: teks, mentions: members }, { quoted: msg })
        } else {
          // Hidetag (Silent mention)
          return sock.sendMessage(from, { text: message, mentions: members }, { quoted: msg })
        }
      }

      /* ================= GROUP INFO SETTINGS ================= */
      if (cmd === 'linkgc') {
        const code = await sock.groupInviteCode(from)
        return sock.sendMessage(from, { text: `🔗 *Link Invite:* https://chat.whatsapp.com/${code}` }, { quoted: msg })
      }

      if (cmd === 'setname') {
        if (!args[0]) return sock.sendMessage(from, { text: '❗ Masukkan nama grup baru.' })
        await sock.groupUpdateSubject(from, args.join(' '))
        return sock.sendMessage(from, { react: { text: '✏️', key: msg.key } })
      }

      if (cmd === 'setdesc') {
        if (!args[0]) return sock.sendMessage(from, { text: '❗ Masukkan deskripsi baru.' })
        await sock.groupUpdateDescription(from, args.join(' '))
        return sock.sendMessage(from, { react: { text: '📝', key: msg.key } })
      }

    } catch (e) {
      console.error(e)
      return sock.sendMessage(from, { text: '❌ Terjadi kesalahan. Pastikan bot adalah admin.' }, { quoted: msg })
    }
  }
}

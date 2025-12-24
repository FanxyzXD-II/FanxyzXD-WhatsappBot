const { reply, isGroup, isAdmin } = require('../lib/util')

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
    'setdesc'
  ],

  run: async ({ sock, msg, from, args, isGroup: isGrp }) => {
    const body =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      ''

    const cmd = body.slice(1).split(' ')[0].toLowerCase()
    const sender = msg.key.participant || msg.key.remoteJid

    /* ================= CEK GROUP ================= */
    if (!isGrp) {
      return reply(sock, from, '❗ Perintah ini hanya untuk grup', msg)
    }

    /* ================= CEK ADMIN ================= */
    const admin = await isAdmin(sock, from, sender)
    if (!admin) {
      return reply(sock, from, '⛔ Kamu bukan admin grup', msg)
    }

    /* ================= GROUP MENU ================= */
    if (cmd === 'groupmenu') {
      return reply(
        sock,
        from,
`👥 *GROUP MENU*

• .add 628xxx
• .kick @tag
• .promote @tag
• .demote @tag
• .linkgc
• .tagall
• .hidetag teks
• .setname nama
• .setdesc deskripsi`,
        msg
      )
    }

    /* ================= ADD MEMBER ================= */
    if (cmd === 'add') {
      if (!args[0]) return reply(sock, from, '❗ .add 628xxx', msg)
      const number = args[0].replace(/\D/g, '') + '@s.whatsapp.net'
      await sock.groupParticipantsUpdate(from, [number], 'add')
      return reply(sock, from, '✅ Member ditambahkan', msg)
    }

    /* ================= KICK MEMBER ================= */
    if (cmd === 'kick') {
      const target =
        msg.message.extendedTextMessage?.contextInfo?.mentionedJid
      if (!target || !target[0])
        return reply(sock, from, '❗ Tag member', msg)

      await sock.groupParticipantsUpdate(from, target, 'remove')
      return reply(sock, from, '🗑️ Member dikeluarkan', msg)
    }

    /* ================= PROMOTE ================= */
    if (cmd === 'promote') {
      const target =
        msg.message.extendedTextMessage?.contextInfo?.mentionedJid
      if (!target || !target[0])
        return reply(sock, from, '❗ Tag member', msg)

      await sock.groupParticipantsUpdate(from, target, 'promote')
      return reply(sock, from, '⬆️ Member dipromosikan', msg)
    }

    /* ================= DEMOTE ================= */
    if (cmd === 'demote') {
      const target =
        msg.message.extendedTextMessage?.contextInfo?.mentionedJid
      if (!target || !target[0])
        return reply(sock, from, '❗ Tag member', msg)

      await sock.groupParticipantsUpdate(from, target, 'demote')
      return reply(sock, from, '⬇️ Admin diturunkan', msg)
    }

    /* ================= LINK GROUP ================= */
    if (cmd === 'linkgc') {
      const link = await sock.groupInviteCode(from)
      return reply(
        sock,
        from,
        `🔗 Link Grup:\nhttps://chat.whatsapp.com/${link}`,
        msg
      )
    }

    /* ================= TAG ALL ================= */
    if (cmd === 'tagall') {
      const metadata = await sock.groupMetadata(from)
      const members = metadata.participants.map(p => p.id)

      let teks = '📣 *TAG ALL*\n\n'
      members.forEach(m => {
        teks += `@${m.split('@')[0]} `
      })

      return sock.sendMessage(
        from,
        {
          text: teks,
          mentions: members
        },
        { quoted: msg }
      )
    }

    /* ================= HIDETAG ================= */
    if (cmd === 'hidetag') {
      const metadata = await sock.groupMetadata(from)
      const members = metadata.participants.map(p => p.id)
      const text = args.join(' ') || ' '

      return sock.sendMessage(
        from,
        {
          text,
          mentions: members
        },
        { quoted: msg }
      )
    }

    /* ================= SET GROUP NAME ================= */
    if (cmd === 'setname') {
      const text = args.join(' ')
      if (!text)
        return reply(sock, from, '❗ .setname nama baru', msg)

      await sock.groupUpdateSubject(from, text)
      return reply(sock, from, '✏️ Nama grup diubah', msg)
    }

    /* ================= SET GROUP DESC ================= */
    if (cmd === 'setdesc') {
      const text = args.join(' ')
      if (!text)
        return reply(sock, from, '❗ .setdesc deskripsi', msg)

      await sock.groupUpdateDescription(from, text)
      return reply(sock, from, '📝 Deskripsi grup diubah', msg)
    }
  }
}
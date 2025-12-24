const { reply, isOwner, isGroup } = require('../lib/util')

module.exports = {
  command: ['pushkontak', 'pushgc'],

  run: async ({ sock, msg, from, args, isGroup: isGrp }) => {
    const body =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      ''

    const sender = msg.key.participant || msg.key.remoteJid
    const cmd = body.slice(1).split(' ')[0].toLowerCase()

    /* ================= OWNER ONLY ================= */
    if (!isOwner(sender)) {
      return reply(sock, from, '⛔ Khusus OWNER bot', msg)
    }

    /* ================= CEK GROUP ================= */
    if (!isGrp) {
      return reply(sock, from, '❗ Push kontak hanya di grup', msg)
    }

    /* ================= FORMAT ================= */
    const text = args.join(' ')
    if (!text) {
      return reply(
        sock,
        from,
        `❗ Format salah\n\nContoh:\n.pushkontak Promo bot WA murah!`,
        msg
      )
    }

    /* ================= AMBIL MEMBER ================= */
    const metadata = await sock.groupMetadata(from)
    const members = metadata.participants
      .filter(v => !v.id.includes('g.us'))
      .map(v => v.id)

    reply(
      sock,
      from,
      `📤 *PUSH KONTAK DIMULAI*\nTotal target: ${members.length}`,
      msg
    )

    let success = 0
    let failed = 0

    /* ================= KIRIM PESAN ================= */
    for (const jid of members) {
      try {
        await sock.sendMessage(jid, { text })
        success++
        await new Promise(r => setTimeout(r, 1200)) // delay aman
      } catch (e) {
        failed++
      }
    }

    /* ================= LAPORAN ================= */
    reply(
      sock,
      from,
      `✅ *PUSH SELESAI*\n\n✔️ Berhasil: ${success}\n❌ Gagal: ${failed}`,
      msg
    )
  }
}
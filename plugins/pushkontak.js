const { delay } = require('@whiskeysockets/baileys')

module.exports = {
  command: ['pushkontak', 'pushgc'],

  run: async ({ sock, msg, from, args, isGroup, config }) => {
    const sender = msg.key.participant || msg.key.remoteJid
    
    /* ================= OWNER ONLY ================= */
    // Pastikan fungsi isOwner tersedia di lib/util atau sesuaikan dengan config
    const isOwner = config.owner.includes(sender.split('@')[0])
    if (!isOwner) {
      return sock.sendMessage(from, { text: '⛔ Fitur ini khusus untuk Owner bot.' }, { quoted: msg })
    }

    /* ================= CEK GROUP ================= */
    if (!isGroup) {
      return sock.sendMessage(from, { text: '❗ Perintah ini hanya dapat dilakukan di dalam grup.' }, { quoted: msg })
    }

    /* ================= MATERI PUSH (TEXT / MEDIA) ================= */
    const text = args.join(' ')
    const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage
    
    if (!text && !quoted) {
      return sock.sendMessage(from, { 
        text: `❗ *Format Salah*\n\nContoh:\n*${config.prefix}pushkontak* Halo kak, save nomor aku ya!\n\n_Atau balas (reply) gambar/video dengan caption perintah tersebut._` 
      }, { quoted: msg })
    }

    /* ================= AMBIL MEMBER ================= */
    const metadata = await sock.groupMetadata(from)
    const members = metadata.participants
      .map(v => v.id)
      .filter(v => v !== sock.user.id.split(':')[0] + '@s.whatsapp.net') // Kecualikan Bot

    await sock.sendMessage(from, { react: { text: '📤', key: msg.key } })
    await sock.sendMessage(from, { 
      text: `📤 *PUSH KONTAK DIMULAI*\n\n👥 *Total Target:* ${members.length}\n⏳ *Estimasi Selesai:* ${Math.ceil((members.length * 3000) / 60000)} Menit\n\n_Mohon jangan matikan bot hingga proses selesai._` 
    }, { quoted: msg })

    let success = 0
    let failed = 0

    /* ================= PROSES KIRIM ================= */
    for (const jid of members) {
      try {
        if (quoted) {
          // Jika push berupa media (reply media)
          await sock.sendMessage(jid, { forward: msg.message.extendedTextMessage.contextInfo.quotedMessage, caption: text }, { quoted: null })
        } else {
          // Jika push berupa teks saja
          await sock.sendMessage(jid, { text: text }, { quoted: null })
        }
        
        success++
        // Delay random 2-4 detik untuk keamanan akun
        await delay(Math.floor(Math.random() * 2000) + 2000) 
      } catch (e) {
        failed++
      }
    }

    /* ================= LAPORAN AKHIR ================= */
    await sock.sendMessage(from, { react: { text: '✅', key: msg.key } })
    const report = `✅ *PUSH KONTAK SELESAI*\n\n📈 *Statistik:*\n✔️ Berhasil: ${success}\n❌ Gagal: ${failed}\n\n_Terima kasih telah menunggu!_`
    
    return sock.sendMessage(from, { text: report }, { quoted: msg })
  }
}

const { downloadMediaMessage } = require('@whiskeysockets/baileys')
const { Sticker, StickerTypes } = require('wa-sticker-formatter')

module.exports = {
  command: ['sticker', 's', 'stiker', 'toimg', 'toimage'],

  run: async ({ sock, msg, from, config }) => {
    const type = Object.keys(msg.message || {})[0]
    const p = config.prefix
    const body = msg.message.conversation || msg.message.extendedTextMessage?.text || ''
    const cmd = body.slice(p.length).trim().split(/ +/)[0].toLowerCase()

    /* ================= LOGIK STICKER TO IMAGE ================= */
    if (cmd === 'toimg' || cmd === 'toimage') {
      const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage
      if (!quoted || !quoted.stickerMessage) {
        return sock.sendMessage(from, { text: `❗ *Format Salah*\n\nBalas (reply) sebuah stiker dengan perintah:\n*${p}toimg*` }, { quoted: msg })
      }

      try {
        await sock.sendMessage(from, { react: { text: '⏳', key: msg.key } })
        
        // Download stiker buffer
        const buffer = await downloadMediaMessage(
          { message: quoted },
          'buffer',
          {}
        )

        // Kirim kembali sebagai gambar
        await sock.sendMessage(from, { 
          image: buffer, 
          caption: '✨ *Sticker to Image Success*' 
        }, { quoted: msg })
        
        return await sock.sendMessage(from, { react: { text: '✅', key: msg.key } })
      } catch (e) {
        console.error(e)
        return sock.sendMessage(from, { text: '❌ Gagal mengonversi stiker ke gambar.' })
      }
    }

    /* ================= LOGIK IMAGE TO STICKER ================= */
    let mediaMessage = msg.message[type]
    if (type === 'extendedTextMessage') {
      const quoted = msg.message.extendedTextMessage.contextInfo?.quotedMessage
      if (quoted) {
        const quotedType = Object.keys(quoted)[0]
        if (quotedType === 'imageMessage' || quotedType === 'videoMessage') {
          mediaMessage = quoted[quotedType]
        }
      }
    }

    if (!mediaMessage || !mediaMessage.mimetype) {
      return sock.sendMessage(from, { 
        text: `❗ *Gagal*\n\nKirim/balas gambar atau video dengan perintah:\n*${p}sticker*` 
      }, { quoted: msg })
    }

    try {
      await sock.sendMessage(from, { react: { text: '⏳', key: msg.key } })
      const buffer = await downloadMediaMessage(
        { message: { [mediaMessage.mimetype.split('/')[0] + 'Message']: mediaMessage } },
        'buffer',
        {}
      )

      const sticker = new Sticker(buffer, {
        pack: 'FanxyzXD II Beta',
        author: 'WhatsApp Bot',
        type: StickerTypes.FULL,
        quality: 50
      })

      const stickerBuffer = await sticker.toBuffer()
      await sock.sendMessage(from, { sticker: stickerBuffer }, { quoted: msg })
      await sock.sendMessage(from, { react: { text: '✅', key: msg.key } })

    } catch (e) {
      console.error(e)
      await sock.sendMessage(from, { react: { text: '❌', key: msg.key } })
    }
  }
}

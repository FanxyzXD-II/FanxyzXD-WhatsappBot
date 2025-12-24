const { Sticker, StickerTypes } = require('wa-sticker-formatter')
const { reply } = require('../lib/util')

module.exports = {
  command: ['sticker', 's', 'stiker'],

  run: async ({ sock, msg, from }) => {
    const type = Object.keys(msg.message || {})[0]

    /* ================= CEK MEDIA ================= */
    let mediaMessage
    if (type === 'imageMessage' || type === 'videoMessage') {
      mediaMessage = msg.message[type]
    } else if (type === 'extendedTextMessage') {
      const quoted = msg.message.extendedTextMessage.contextInfo?.quotedMessage
      if (quoted?.imageMessage) mediaMessage = quoted.imageMessage
      if (quoted?.videoMessage) mediaMessage = quoted.videoMessage
    }

    if (!mediaMessage) {
      return reply(
        sock,
        from,
        `❗ Kirim atau reply gambar/video\n\nContoh:\n.reply gambar + .sticker`,
        msg
      )
    }

    /* ================= DOWNLOAD MEDIA ================= */
    const buffer = await sock.downloadMediaMessage(
      mediaMessage,
      'buffer'
    )

    reply(sock, from, '⏳ Membuat sticker...', msg)

    /* ================= BUAT STICKER ================= */
    const sticker = new Sticker(buffer, {
      pack: 'FanxyzXD II Beta',
      author: 'WA Bot',
      type: StickerTypes.FULL,
      quality: 50
    })

    const stickerBuffer = await sticker.toBuffer()

    await sock.sendMessage(
      from,
      { sticker: stickerBuffer },
      { quoted: msg }
    )
  }
}
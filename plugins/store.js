const fs = require('fs')
const path = require('path')
const { reply, isOwner } = require('../lib/util')

/* ================= DATABASE PRODUK ================= */
const dbPath = path.join(__dirname, '../database/store.json')

if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify([], null, 2))
}

const loadProduk = () => JSON.parse(fs.readFileSync(dbPath))
const saveProduk = data =>
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2))

module.exports = {
  command: [
    'store',
    'listproduk',
    'addproduk',
    'delproduk',
    'order',
    'payment'
  ],

  run: async ({ sock, msg, from, args, pushname, config }) => {
    const body =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      ''

    const cmd = body.slice(1).split(' ')[0].toLowerCase()

    /* ================= LIST PRODUK ================= */
    if (cmd === 'store' || cmd === 'listproduk') {
      const produk = loadProduk()

      if (produk.length === 0) {
        return reply(sock, from, '🛒 Store masih kosong', msg)
      }

      let teks = '🛒 *DAFTAR PRODUK*\n\n'
      produk.forEach((p, i) => {
        teks += `📦 ${i + 1}. ${p.nama}\n`
        teks += `💰 Harga: Rp${p.harga}\n`
        teks += `📝 ${p.deskripsi}\n\n`
      })

      teks += `Order:\n.order nama_produk`

      return sock.sendMessage(from, { text: teks })
    }

    /* ================= ADD PRODUK (OWNER) ================= */
    if (cmd === 'addproduk') {
      if (!isOwner(msg.key.remoteJid, config.owner))
        return reply(sock, from, '⛔ Owner only', msg)

      const teks = args.join(' ')
      const split = teks.split('|')

      if (split.length < 3) {
        return reply(
          sock,
          from,
          '❗ Format:\n.addproduk nama | harga | deskripsi',
          msg
        )
      }

      const [nama, harga, deskripsi] = split.map(v => v.trim())
      const produk = loadProduk()

      produk.push({ nama, harga, deskripsi })
      saveProduk(produk)

      return reply(
        sock,
        from,
        `✅ Produk *${nama}* berhasil ditambahkan`,
        msg
      )
    }

    /* ================= DELETE PRODUK (OWNER) ================= */
    if (cmd === 'delproduk') {
      if (!isOwner(msg.key.remoteJid, config.owner))
        return reply(sock, from, '⛔ Owner only', msg)

      if (!args[0])
        return reply(sock, from, '❗ .delproduk nomor', msg)

      const produk = loadProduk()
      const index = parseInt(args[0]) - 1

      if (!produk[index])
        return reply(sock, from, '❌ Produk tidak ditemukan', msg)

      const hapus = produk.splice(index, 1)
      saveProduk(produk)

      return reply(
        sock,
        from,
        `🗑️ Produk *${hapus[0].nama}* dihapus`,
        msg
      )
    }

    /* ================= ORDER ================= */
    if (cmd === 'order') {
      if (!args[0])
        return reply(sock, from, '❗ .order nama_produk', msg)

      const produk = loadProduk()
      const namaCari = args.join(' ').toLowerCase()
      const item = produk.find(p =>
        p.nama.toLowerCase().includes(namaCari)
      )

      if (!item)
        return reply(sock, from, '❌ Produk tidak ditemukan', msg)

      await reply(
        sock,
        from,
        `🛒 *ORDER BERHASIL*
📦 Produk: ${item.nama}
💰 Harga: Rp${item.harga}

Silakan lakukan pembayaran dengan perintah:
.payment`,
        msg
      )

      // kirim notif ke owner
      for (const own of config.owner) {
        await sock.sendMessage(own + '@s.whatsapp.net', {
          text:
`📥 ORDER BARU
👤 ${pushname}
📦 ${item.nama}
💰 Rp${item.harga}`
        })
      }
    }

    /* ================= PAYMENT INFO ================= */
    if (cmd === 'payment') {
      return reply(
        sock,
        from,
        `💳 *METODE PEMBAYARAN*

• Dana : 08xxxxxxxxxx
• OVO  : 08xxxxxxxxxx
• Gopay: 08xxxxxxxxxx

📸 Kirim bukti pembayaran ke owner`,
        msg
      )
    }
  }
}
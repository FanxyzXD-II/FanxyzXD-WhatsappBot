const fs = require('fs')
const path = require('path')

/* ================= DATABASE SYSTEM ================= */
const dbDir = path.join(__dirname, '../database')
const dbPath = path.join(dbDir, 'store.json')

// Inisialisasi folder database jika belum ada
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true })

function loadProduk() {
  try {
    if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify([], null, 2))
    return JSON.parse(fs.readFileSync(dbPath))
  } catch (e) {
    console.error('Error loading Store DB:', e)
    return []
  }
}

const saveProduk = data => fs.writeFileSync(dbPath, JSON.stringify(data, null, 2))

module.exports = {
  command: ['store', 'listproduk', 'addproduk', 'delproduk', 'order', 'payment'],

  run: async ({ sock, msg, from, args, pushname, config }) => {
    const body = msg.message.conversation || msg.message.extendedTextMessage?.text || ''
    const p = config.prefix
    const cmd = body.slice(p.length).trim().split(/ +/)[0].toLowerCase()
    const sender = msg.key.participant || msg.key.remoteJid
    
    // Verifikasi Owner dari config
    const isOwner = config.owner.includes(sender.split('@')[0])

    /* ================= LIST PRODUK ================= */
    if (cmd === 'store' || cmd === 'listproduk') {
      const produk = loadProduk()
      if (produk.length === 0) return sock.sendMessage(from, { text: '🛒 *STORE INFO*\n\nMaaf, saat ini belum ada produk yang tersedia.' }, { quoted: msg })

      let teks = '🛒 *FANXYZXD STORE MENU*\n\n'
      produk.forEach((item, i) => {
        teks += `*${i + 1}. ${item.nama}*\n`
        teks += `💰 Harga: Rp${item.harga}\n`
        teks += `📝 Deskripsi: ${item.deskripsi}\n\n`
      })
      teks += `_Untuk memesan, ketik: *${p}order [nama_produk]*_`
      return sock.sendMessage(from, { text: teks }, { quoted: msg })
    }

    /* ================= ADD PRODUK (OWNER) ================= */
    if (cmd === 'addproduk') {
      if (!isOwner) return sock.sendMessage(from, { text: '⛔ Perintah ini khusus untuk Owner.' })

      const input = args.join(' ')
      const split = input.split('|')
      if (split.length < 3) return sock.sendMessage(from, { text: `❗ *Format Salah*\n\nGunakan: *${p}addproduk* nama | harga | deskripsi` }, { quoted: msg })

      const [nama, harga, deskripsi] = split.map(v => v.trim())
      const produk = loadProduk()

      produk.push({ nama, harga, deskripsi })
      saveProduk(produk)

      await sock.sendMessage(from, { react: { text: '✅', key: msg.key } })
      return sock.sendMessage(from, { text: `✅ Produk *${nama}* berhasil ditambahkan ke database.` }, { quoted: msg })
    }

    /* ================= DELETE PRODUK (OWNER) ================= */
    if (cmd === 'delproduk') {
      if (!isOwner) return sock.sendMessage(from, { text: '⛔ Perintah ini khusus untuk Owner.' })
      if (!args[0]) return sock.sendMessage(from, { text: `❗ Masukkan nomor produk!\nContoh: *${p}delproduk 1*` })

      const produk = loadProduk()
      const index = parseInt(args[0]) - 1
      if (!produk[index]) return sock.sendMessage(from, { text: '❌ Produk tidak ditemukan.' })

      const hapus = produk.splice(index, 1)
      saveProduk(produk)

      await sock.sendMessage(from, { react: { text: '🗑️', key: msg.key } })
      return sock.sendMessage(from, { text: `🗑️ Berhasil menghapus produk: *${hapus[0].nama}*` }, { quoted: msg })
    }

    /* ================= ORDER ================= */
    if (cmd === 'order') {
      if (!args[0]) return sock.sendMessage(from, { text: `❗ Masukkan nama produk!\nContoh: *${p}order Diamond*` })

      const produk = loadProduk()
      const item = produk.find(v => v.nama.toLowerCase().includes(args.join(' ').toLowerCase()))
      if (!item) return sock.sendMessage(from, { text: '❌ Produk tidak ditemukan dalam list.' })

      await sock.sendMessage(from, { react: { text: '⏳', key: msg.key } })
      const invoice = `🛒 *ORDER BERHASIL*\n\n📦 *Produk:* ${item.nama}\n💰 *Harga:* Rp${item.harga}\n👤 *Pemesan:* ${pushname}\n\nSilahkan lakukan pembayaran dengan mengetik *${p}payment*`
      await sock.sendMessage(from, { text: invoice }, { quoted: msg })

      // Notifikasi ke Owner
      for (const ownerId of config.owner) {
        await sock.sendMessage(ownerId + '@s.whatsapp.net', {
          text: `📥 *ORDER BARU MASUK*\n\n👤 User: ${pushname}\n📦 Item: ${item.nama}\n💰 Harga: Rp${item.harga}\n📱 JID: ${sender}`
        })
      }
    }

    /* ================= PAYMENT INFO ================= */
    if (cmd === 'payment') {
      const payInfo = `💳 *METODE PEMBAYARAN*\n\n• *DANA:* ${config.dana || '08xxxxxxxx'}\n• *OVO:* ${config.ovo || '08xxxxxxxx'}\n• *GOPAY:* ${config.gopay || '08xxxxxxxx'}\n\n📸 *Penting:* Kirim bukti transfer ke Owner bot untuk proses verifikasi.`
      return sock.sendMessage(from, { text: payInfo }, { quoted: msg })
    }
  }
}

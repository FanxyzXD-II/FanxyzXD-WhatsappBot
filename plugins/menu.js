const fs = require('fs')
const path = require('path')
const os = require('os')
const { exec } = require('child_process')

// Fungsi untuk menghitung lama bot berjalan
function runtime(seconds) {
  seconds = Number(seconds)
  var d = Math.floor(seconds / (3600 * 24))
  var h = Math.floor((seconds % (3600 * 24)) / 3600)
  var m = Math.floor((seconds % 3600) / 60)
  var s = Math.floor(seconds % 60)
  var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : ""
  var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : ""
  var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : ""
  var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : ""
  return dDisplay + hDisplay + mDisplay + sDisplay
}

module.exports = {
  command: ['menu', 'help', 'allmenu'],

  run: async ({ sock, msg, from, pushname, config }) => {
    const p = config.prefix
    const date = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    const time = new Date().toLocaleTimeString('id-ID')
    const uptime = runtime(process.uptime())
    
    // Hitung Speed (Latency)
    const timestamp = Date.now()
    const latensi = Date.now() - timestamp

    const menuText = `
╭───「 *FANXYZXD II BETA* 」───
│ 
│ 👋 Halo, *${pushname}*!
│
│ 📅 *Tanggal:* ${date}
│ ⌚ *Waktu:* ${time}
│ ⏳ *Runtime:* ${uptime}
│ 🚀 *Speed:* ${latensi}ms
│ 🛠️ *Prefix:* [ ${p} ]
│
╰──────────────────────────

╭───「 *MAIN MENU* 」
│ • ${p}owner
│ • ${p}sewabot
│ • ${p}ceksewa
│ • ${p}runtime
╰──────────────────

╭───「 *ISLAM MENU* 」
│ • ${p}jadwalsholat
│ • ${p}doaharian
│ • ${p}alquran
│ • ${p}ayatkursi
╰──────────────────

╭───「 *GROUP MENU* 」
│ • ${p}add
│ • ${p}kick
│ • ${p}promote
│ • ${p}demote
│ • ${p}linkgc
│ • ${p}tagall
│ • ${p}hidetag
╰──────────────────

╭───「 *ANONYMOUS* 」
│ • ${p}anon
│ • ${p}next
│ • ${p}stop
│ • ${p}sendprofile
╰──────────────────

╭───「 *DOWNLOADER* 」
│ • ${p}ytmp3
│ • ${p}ytmp4
│ • ${p}tiktok
│ • ${p}ig
╰──────────────────

╭───「 *ANIME & TOOLS* 」
│ • ${p}anime
│ • ${p}waifu
│ • ${p}neko
│ • ${p}ephoto
│ • ${p}sticker
╰──────────────────

╭───「 *GAME & FUN* 」
│ • ${p}tebakangka
│ • ${p}skor
│ • ${p}jodoh
│ • ${p}truth
│ • ${p}dare
│ • ${p}quotes
╰──────────────────

╭───「 *INFO SYSTEM* 」
│ • RAM: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${Math.round(os.totalmem() / 1024 / 1024)}MB
│ • Host: ${os.hostname()}
│ • Platform: ${os.platform()}
╰──────────────────

*Note:* Gunakan bot dengan bijak!
`

    const imagePath = path.join(__dirname, '../media/menu.jpg')

    try {
      if (fs.existsSync(imagePath)) {
        await sock.sendMessage(
          from,
          {
            image: fs.readFileSync(imagePath),
            caption: menuText,
            contextInfo: {
              externalAdReply: {
                title: "FanxyzXD Multi-Device",
                body: "Powered by Baileys",
                thumbnailUrl: "https://telegra.ph/file/logo.jpg", // Opsional
                sourceUrl: "https://github.com/",
                mediaType: 1,
                renderLargerThumbnail: true
              }
            }
          },
          { quoted: msg }
        )
      } else {
        await sock.sendMessage(from, { text: menuText }, { quoted: msg })
      }
    } catch (e) {
      console.error(e)
      await sock.sendMessage(from, { text: menuText }, { quoted: msg })
    }
  }
}

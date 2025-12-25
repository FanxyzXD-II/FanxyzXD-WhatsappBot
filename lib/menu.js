/**
 * MENU HANDLER - lib/menu.js
 * Diperbarui untuk mendukung tampilan modern dan informasi sistem real-time.
 */

const fs = require('fs')
const os = require('os')

// Fungsi untuk menghitung durasi bot berjalan
function runtime(seconds) {
  seconds = Number(seconds)
  const d = Math.floor(seconds / (3600 * 24))
  const h = Math.floor((seconds % (3600 * 24)) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  return `${d}d ${h}h ${m}m ${s}s`
}

module.exports = (pushname, config) => {
  const p = config?.prefix || '.'
  const date = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  const time = new Date().toLocaleTimeString('id-ID')
  const uptime = runtime(process.uptime())
  const ram = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)
  const totalRam = Math.round(os.totalmem() / 1024 / 1024)

  return `
╭━━〔 🤖 *${config?.botName || 'FANXYZXD'}* 〕━━╮
┃ 👤 *User:* ${pushname}
┃ 📅 *Date:* ${date}
┃ ⌚ *Time:* ${time}
┃ ⏳ *Uptime:* ${uptime}
┃ 🚀 *Ram:* ${ram}MB / ${totalRam}MB
╰━━━━━━━━━━━━━━━━━━━━╯

╭━━〔 🏪 *STORE MENU* 〕━━╮
┃ • ${p}listproduk
┃ • ${p}order
┃ • ${p}payment
┃ • ${p}addproduk (Owner)
┃ • ${p}delproduk (Owner)
╰━━━━━━━━━━━━━━━━━━━━╯

╭━━〔 ☪ *ISLAM MENU* 〕━━╮
┃ • ${p}jadwalsholat
┃ • ${p}alquran
┃ • ${p}doaharian
╰━━━━━━━━━━━━━━━━━━━━╯

╭━━〔 👥 *GROUP MENU* 〕━━╮
┃ • ${p}add
┃ • ${p}kick
┃ • ${p}promote
┃ • ${p}demote
┃ • ${p}linkgc
┃ • ${p}tagall
┃ • ${p}hidetag
╰━━━━━━━━━━━━━━━━━━━━╯

╭━━〔 🕶 *ANONYMOUS* 〕━━╮
┃ • ${p}anon
┃ • ${p}next
┃ • ${p}stop
┃ • ${p}sendprofile
╰━━━━━━━━━━━━━━━━━━━━╯

╭━━〔 📤 *PUSH KONTAK* 〕━━╮
┃ • ${p}pushkontak (Owner)
┃ • ${p}pushgc (Owner)
╰━━━━━━━━━━━━━━━━━━━━╯

╭━━〔 🎌 *ANIME MENU* 〕━━╮
┃ • ${p}anime
┃ • ${p}waifu
┃ • ${p}neko
┃ • ${p}animequote
╰━━━━━━━━━━━━━━━━━━━━╯

╭━━〔 🎮 *GAME MENU* 〕━━╮
┃ • ${p}tebakangka
┃ • ${p}skor
╰━━━━━━━━━━━━━━━━━━━━╯

╭━━〔 🧙 *RPG MENU* 〕━━╮
┃ • ${p}status
┃ • ${p}inventory
┃ • ${p}hunt
┃ • ${p}adventure
┃ • ${p}heal
┃ • ${p}buy
╰━━━━━━━━━━━━━━━━━━━━╯

╭━━〔 📹 *RANDOM MEDIA* 〕━━╮
┃ • ${p}randomvideo
┃ • ${p}randomfoto
┃ • ${p}asupan
╰━━━━━━━━━━━━━━━━━━━━╯

╭━━〔 🤖 *OPENAI MENU* 〕━━╮
┃ • ${p}ai
┃ • ${p}ask
╰━━━━━━━━━━━━━━━━━━━━╯

╭━━〔 😄 *FUN MENU* 〕━━╮
┃ • ${p}jodoh
┃ • ${p}rate
┃ • ${p}truth
┃ • ${p}dare
┃ • ${p}faktaunik
┃ • ${p}quotes
╰━━━━━━━━━━━━━━━━━━━━╯

╭━━〔 🖼 *STICKER MENU* 〕━━╮
┃ • ${p}sticker
┃ • ${p}toimg
╰━━━━━━━━━━━━━━━━━━━━╯

╭━━〔 ⬇ *DOWNLOADER* 〕━━╮
┃ • ${p}ytmp3
┃ • ${p}ytmp4
┃ • ${p}tiktok
┃ • ${p}ig
╰━━━━━━━━━━━━━━━━━━━━╯

╭━━〔 🎨 *EPHOTO MAKER* 〕━━╮
┃ • ${p}ephotomenu
┃ • ${p}neon
┃ • ${p}glitch
╰━━━━━━━━━━━━━━━━━━━━╯

╭━━〔 🔮 *PRIMBON* 〕━━╮
┃ • ${p}artinama
┃ • ${p}jodohnama
┃ • ${p}rezeki
┃ • ${p}weton
╰━━━━━━━━━━━━━━━━━━━━╯

╭━━〔 🤝 *SEWA BOT* 〕━━╮
┃ • ${p}sewabot
┃ • ${p}ceksewa
┃ • ${p}addsewa (Owner)
┃ • ${p}sewalist (Owner)
╰━━━━━━━━━━━━━━━━━━━━╯
`
}

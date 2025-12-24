const chalk = require('chalk')

/* ================= RANDOM COLOR ================= */
function randomColor(text) {
  const colors = [chalk.red, chalk.green, chalk.blue]
  return colors[Math.floor(Math.random() * colors.length)](text)
}

/* ================= DELAY ================= */
const delay = ms => new Promise(res => setTimeout(res, ms))

/* ================= RUNTIME ================= */
function runtime(seconds) {
  seconds = Number(seconds)
  const d = Math.floor(seconds / (3600 * 24))
  const h = Math.floor(seconds % (3600 * 24) / 3600)
  const m = Math.floor(seconds % 3600 / 60)
  const s = Math.floor(seconds % 60)

  return `${d} hari ${h} jam ${m} menit ${s} detik`
}

/* ================= FORMAT WAKTU ================= */
function clockString(ms) {
  const h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
  const m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  const s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}

/* ================= PARSE MESSAGE ================= */
function getBody(msg) {
  return (
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    msg.message?.imageMessage?.caption ||
    msg.message?.videoMessage?.caption ||
    ''
  )
}

/* ================= GET SENDER ================= */
function getSender(msg) {
  return msg.key.participant || msg.key.remoteJid
}

/* ================= GET NUMBER ================= */
function getNumber(jid) {
  return jid.split('@')[0]
}

/* ================= CEK GROUP ================= */
function isGroup(jid) {
  return jid.endsWith('@g.us')
}

/* ================= CEK OWNER ================= */
function isOwner(sender, ownerList = []) {
  const num = sender.split('@')[0]
  return ownerList.includes(num)
}

/* ================= CEK ADMIN ================= */
async function isAdmin(sock, from, sender) {
  const metadata = await sock.groupMetadata(from)
  const admins = metadata.participants
    .filter(p => p.admin)
    .map(p => p.id)
  return admins.includes(sender)
}

/* ================= REPLY HELPER ================= */
async function reply(sock, from, text, msg) {
  return sock.sendMessage(
    from,
    { text },
    { quoted: msg }
  )
}

/* ================= EXPORT ================= */
module.exports = {
  randomColor,
  delay,
  runtime,
  clockString,
  getBody,
  getSender,
  getNumber,
  isGroup,
  isOwner,
  isAdmin,
  reply
}
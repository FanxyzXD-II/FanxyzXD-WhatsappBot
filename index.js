const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require('@whiskeysockets/baileys')

const fs = require('fs')
const path = require('path')
const P = require('pino')
const chalk = require('chalk')
const figlet = require('figlet')
const gradient = require('gradient-string')
const readline = require('readline')

const config = require('./config')
const menu = require('./lib/menu')

/* ===================== TERMINAL BANNER ===================== */
function showBanner() {
  console.clear()
  console.log(
    gradient.pastel(
      figlet.textSync('FanxyzXD II Beta', { font: 'Standard' })
    )
  )
  console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'))
  console.log(chalk.green('🤖 WhatsApp Bot Multi Device'))
  console.log(chalk.yellow('🚀 System Starting...\n'))
}

async function loadingBanner() {
  const icon = ['📈', '📉']
  let i = 0
  return new Promise(resolve => {
    const t = setInterval(() => {
      process.stdout.write(
        `\r${chalk.magenta('Loading System')} ${icon[i++ % 2]}`
      )
    }, 400)
    setTimeout(() => {
      clearInterval(t)
      process.stdout.write('\n\n')
      resolve()
    }, 3000)
  })
}

/* ===================== WARNA CHAT ===================== */
function randomColor(text) {
  const c = [chalk.red, chalk.green, chalk.blue]
  return c[Math.floor(Math.random() * c.length)](text)
}

/* ===================== PAIRING INPUT ===================== */
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})
const ask = q => new Promise(r => rl.question(q, r))

/* ===================== LOAD PLUGINS ===================== */
const plugins = {}
const pluginDir = path.join(__dirname, 'plugins')

fs.readdirSync(pluginDir).forEach(file => {
  if (file.endsWith('.js')) {
    const name = file.replace('.js', '')
    plugins[name] = require(`./plugins/${file}`)
  }
})

/* ===================== START BOT ===================== */
async function startBot() {
  showBanner()
  await loadingBanner()

  const { state, saveCreds } = await useMultiFileAuthState('./session')
  const sock = makeWASocket({
    auth: state,
    logger: P({ level: 'silent' }),
    printQRInTerminal: false
  })

  // PAIRING CODE
  if (!sock.authState.creds.registered) {
    const nomor = await ask('📱 Masukkan nomor WA (628xxxx): ')
    const code = await sock.requestPairingCode(nomor.trim())
    console.log(chalk.green(`\n🔑 Pairing Code: ${code}\n`))
  }

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0]
    if (!msg.message) return

    const from = msg.key.remoteJid
    const isGroup = from.endsWith('@g.us')
    const pushname = msg.pushName || 'Unknown'

    const body =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      msg.message.imageMessage?.caption ||
      msg.message.videoMessage?.caption ||
      ''

    // LOG TERMINAL REALTIME 🔴🟢🔵
    console.log(
      randomColor(`[ CHAT ] ${pushname} (${from}) : ${body}`)
    )

    if (!body.startsWith(config.prefix)) return
    const args = body.slice(1).trim().split(/ +/)
    const command = args.shift().toLowerCase()

    /* ===================== MENU ===================== */
    if (command === 'menu') {
      return sock.sendMessage(from, {
        image: fs.readFileSync('./media/menu.jpg'),
        caption: menu(pushname)
      })
    }

    /* ===================== ROUTER PLUGIN ===================== */
for (const plugin of Object.values(plugins)) {
  if (!plugin.command || !plugin.command.includes(command)) continue

  try {

    /* ===== CEK SEWA BOT (PASANG DI SINI) ===== */
    if (plugin.isAllowed) {
      if (!plugin.isAllowed(from)) {
        return sock.sendMessage(
          from,
          { text: '❌ Bot ini belum disewa\nHubungi owner untuk sewa' },
          { quoted: msg }
        )
      }
    }

    /* ===== JALANKAN PLUGIN ===== */
    await plugin.run({
      sock,
      msg,
      from,
      args,
      pushname,
      isGroup,
      config
    })

  } catch (e) {
    console.log(chalk.red('[PLUGIN ERROR]'), e)
    sock.sendMessage(from, { text: '❌ Terjadi error pada fitur ini' })
  }

  return
}
  })
}

startBot()
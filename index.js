const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore
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
  console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'))
  console.log(chalk.green('🤖 WhatsApp Bot Multi Device - Updated Version'))
  console.log(chalk.yellow('🚀 System Starting...\n'))
}

async function loadingBanner() {
  return new Promise(resolve => {
    let i = 0
    const icon = ['📈', '📉']
    const t = setInterval(() => {
      process.stdout.write(
        `\r${chalk.magenta('Loading System')} ${icon[i++ % 2]}`
      )
    }, 400)
    setTimeout(() => {
      clearInterval(t)
      process.stdout.write('\n\n')
      resolve()
    }, 2000)
  })
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})
const ask = q => new Promise(r => rl.question(q, r))

/* ===================== LOAD PLUGINS ===================== */
const plugins = {}
const pluginDir = path.join(__dirname, 'plugins')

function loadPlugins() {
  if (!fs.existsSync(pluginDir)) fs.mkdirSync(pluginDir)
  fs.readdirSync(pluginDir).forEach(file => {
    if (file.endsWith('.js')) {
      const name = file.replace('.js', '')
      delete require.cache[require.resolve(`./plugins/${file}`)] // Clear cache for hot reload
      plugins[name] = require(`./plugins/${file}`)
    }
  })
}

/* ===================== START BOT ===================== */
async function startBot() {
  showBanner()
  await loadingBanner()
  loadPlugins()

  const { state, saveCreds } = await useMultiFileAuthState('./session')
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, P({ level: 'silent' }))
    },
    logger: P({ level: 'silent' }),
    printQRInTerminal: false,
    browser: ["Ubuntu", "Chrome", "20.0.04"], // Menghindari deteksi bot
    generateHighQualityLinkPreview: true
  })

  // PAIRING CODE LOGIC
  if (!sock.authState.creds.registered) {
    console.log(chalk.yellow('--- PAIRING MODE ---'))
    const nomor = await ask(chalk.white('📱 Masukkan nomor WA (contoh: 628xxx): '))
    const code = await sock.requestPairingCode(nomor.replace(/[^0-9]/g, ''))
    console.log(chalk.black.bgGreen(`\n 🔑 Pairing Code Anda: ${code} \n`))
  }

  // CONNECTION HANDLER
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update
    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut
      console.log(chalk.red('Koneksi terputus. Mencoba menghubungkan kembali...'), shouldReconnect)
      if (shouldReconnect) startBot()
    } else if (connection === 'open') {
      console.log(chalk.green('✅ Bot Berhasil Terhubung!'))
    }
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return
    const msg = messages[0]
    if (!msg.message || msg.key.fromMe) return

    const from = msg.key.remoteJid
    const isGroup = from.endsWith('@g.us')
    const pushname = msg.pushName || 'User'

    // TEXT EXTRACTOR
    const body = (
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      msg.message.imageMessage?.caption ||
      msg.message.videoMessage?.caption ||
      msg.message.documentMessage?.caption ||
      ''
    )

    // LOG CHAT
    console.log(
      chalk.black.bgCyan(`[ MSG ]`) + chalk.white(` ${pushname}: ${body.slice(0, 30)}...`)
    )

    if (!body.startsWith(config.prefix)) return
    const args = body.slice(config.prefix.length).trim().split(/ +/)
    const command = args.shift().toLowerCase()

    /* ===================== COMMAND: MENU ===================== */
    if (command === 'menu') {
      const menuPath = './media/menu.jpg'
      const menuCaption = typeof menu === 'function' ? menu(pushname) : 'Daftar Menu Tersedia'
      
      if (fs.existsSync(menuPath)) {
        return sock.sendMessage(from, { image: fs.readFileSync(menuPath), caption: menuCaption })
      } else {
        return sock.sendMessage(from, { text: menuCaption })
      }
    }

    /* ===================== PLUGIN ENGINE ===================== */
    for (const plugin of Object.values(plugins)) {
      if (!plugin.command || !plugin.command.includes(command)) continue

      try {
        // Cek Izin/Sewa
        if (plugin.isAllowed && !plugin.isAllowed(from)) {
          return sock.sendMessage(from, { text: '❌ Bot ini belum disewa untuk grup ini.' }, { quoted: msg })
        }

        // Jalankan Plugin
        await plugin.run({
          sock,
          msg,
          from,
          args,
          pushname,
          isGroup,
          config,
          body
        })
        return // Stop loop jika perintah ditemukan
      } catch (e) {
        console.error(chalk.red('[PLUGIN ERROR]'), e)
        sock.sendMessage(from, { text: '❌ Terjadi kesalahan saat menjalankan perintah.' })
      }
    }
  })
}

// Global Error Handling
process.on('uncaughtException', console.error)
process.on('unhandledRejection', console.error)

startBot()

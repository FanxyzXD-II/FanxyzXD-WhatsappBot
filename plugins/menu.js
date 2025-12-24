const fs = require('fs')
const path = require('path')
const { reply } = require('../lib/util')

module.exports = {
  command: ['menu','help','allmenu'],

  run: async ({ sock, msg, from, pushname }) => {

    const menuText = `
╔════════════════════╗
║ 🤖 *FANXYZXD II BETA* 🤖
╚════════════════════╝
Halo, *${pushname}* 👋

📌 *MAIN MENU*
• .owner
• .sewabot
• .ceksewa

🛒 *STORE MENU*
• .store
• .addproduk
• .listproduk

🕌 *ISLAM MENU*
• .jadwalsholat
• .doaharian
• .ayatkursi

👥 *GROUP MENU*
• .add
• .kick
• .promote
• .demote
• .linkgc

👤 *ANONYMOUS*
• .anonymous
• .next
• .stop

📢 *PUSH KONTAK*
• .pushkontak

🖥️ *CPANEL*
• .cpanel
• .listserver

🎌 *ANIME*
• .anime
• .animepic
• .animevideo

🎮 *GAME*
• .gamemenu
• .rpgmenu

⚔️ *RPG*
• .profile
• .inventory
• .daily
• .battle

📝 *QUOTES*
• .quotes
• .faktaunik

🎥 *RANDOM VIDEO*
• .asupan
• .tiktokrandom
• .animevideo

🔎 *STALK*
• .igstalk
• .ghstalk

🤖 *OPEN AI*
• .ai
• .ask

🎉 *FUN*
• .funmenu
• .jodoh
• .truth
• .dare

📸 *RANDOM PHOTO*
• .animepic
• .cewek
• .cowok
• .meme

🧩 *STICKER*
• .sticker

✨ *TOOLS*
• .ephoto
• .neon
• .glitch
• .penjernih

⬇️ *DOWNLOADER*
• .ytmp3
• .ytmp4
• .tiktok
• .ig

🔮 *PRIMBOM*
• .artinama
• .jodohnama
• .weton

🤝 *SEWA BOT*
• .sewabot
• .ceksewa

╔════════════════════╗
║ ⚡ FanxyzXD II Beta ⚡
╚════════════════════╝
`

    const imagePath = path.join(__dirname, '../media/menu.jpg')

    if (fs.existsSync(imagePath)) {
      await sock.sendMessage(
        from,
        {
          image: fs.readFileSync(imagePath),
          caption: menuText
        },
        { quoted: msg }
      )
    } else {
      reply(sock, from, menuText, msg)
    }
  }
}
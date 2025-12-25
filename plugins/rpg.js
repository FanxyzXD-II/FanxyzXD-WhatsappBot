const fs = require('fs')
const path = require('path')

/* ================= DATABASE SYSTEM ================= */
const dbDir = path.join(__dirname, '../database')
const dbPath = path.join(dbDir, 'rpg.json')

// Pastikan folder database ada
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true })

function loadDB() {
  try {
    return fs.existsSync(dbPath) ? JSON.parse(fs.readFileSync(dbPath)) : {}
  } catch (e) {
    console.error('Error loading RPG DB:', e)
    return {}
  }
}

function saveDB(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2))
}

let rpg = loadDB()

/* ================= USER LOGIC ================= */
function getUser(jid) {
  if (!rpg[jid]) {
    rpg[jid] = {
      level: 1,
      exp: 0,
      gold: 50, // Modal awal
      health: 100,
      potion: 2,
      lastHunt: 0
    }
    saveDB(rpg)
  }
  return rpg[jid]
}

function levelUp(user) {
  const need = user.level * 150
  if (user.exp >= need) {
    user.level++
    user.exp -= need
    user.health = 100
    return true
  }
  return false
}

module.exports = {
  command: ['rpgmenu', 'status', 'hunt', 'adventure', 'heal', 'inventory', 'buy'],

  run: async ({ sock, msg, from, config }) => {
    const body = msg.message.conversation || msg.message.extendedTextMessage?.text || ''
    const sender = msg.key.participant || msg.key.remoteJid
    const p = config.prefix
    const cmd = body.slice(p.length).trim().split(/ +/)[0].toLowerCase()
    const user = getUser(sender)

    try {
      /* ================= MENU ================= */
      if (cmd === 'rpgmenu') {
        const menu = `🗡️ *FANXYZXD RPG SYSTEM*

• *${p}status* → Cek level & darah
• *${p}hunt* → Berburu monster (Easy)
• *${p}adventure* → Petualangan (Hard)
• *${p}heal* → Gunakan 1 potion
• *${p}inventory* → Cek barang
• *${p}buy potion* → Harga 100 gold`
        return sock.sendMessage(from, { text: menu }, { quoted: msg })
      }

      /* ================= STATUS ================= */
      if (cmd === 'status' || cmd === 'inventory') {
        const stat = `📊 *RPG PROFILE - @${sender.split('@')[0]}*

❤️ Health: ${user.health}
🌟 Level: ${user.level}
✨ EXP: ${user.exp} / ${user.level * 150}
💰 Gold: ${user.gold}
🧪 Potion: ${user.potion}`
        return sock.sendMessage(from, { text: stat, mentions: [sender] }, { quoted: msg })
      }

      /* ================= HUNT ================= */
      if (cmd === 'hunt') {
        if (user.health < 20) return sock.sendMessage(from, { text: '💀 Darahmu terlalu rendah! Heal dulu.' }, { quoted: msg })
        
        // Cooldown 1 menit
        const cd = 60000 
        if (Date.now() - user.lastHunt < cd) {
          const s = Math.ceil((cd - (Date.now() - user.lastHunt)) / 1000)
          return sock.sendMessage(from, { text: `⏳ Tunggu ${s} detik lagi untuk berburu.` }, { quoted: msg })
        }

        await sock.sendMessage(from, { react: { text: '🏹', key: msg.key } })
        
        const exp = Math.floor(Math.random() * 50) + 20
        const gold = Math.floor(Math.random() * 40) + 10
        const dmg = Math.floor(Math.random() * 15) + 5

        user.exp += exp
        user.gold += gold
        user.health -= dmg
        user.lastHunt = Date.now()

        const up = levelUp(user)
        saveDB(rpg)

        return sock.sendMessage(from, { text: `🏹 *HUNT RESULT*\n\n✨ +${exp} EXP\n💰 +${gold} Gold\n🩸 -${dmg} Health\n${up ? '🎊 *LEVEL UP!*' : ''}` }, { quoted: msg })
      }

      /* ================= SHOP ================= */
      if (cmd === 'buy') {
        if (args[0] === 'potion') {
          if (user.gold < 100) return sock.sendMessage(from, { text: '❌ Gold kamu tidak cukup (Butuh 100 Gold).' })
          user.gold -= 100
          user.potion += 1
          saveDB(rpg)
          return sock.sendMessage(from, { text: '✅ Berhasil membeli 1 Potion.' }, { quoted: msg })
        }
        return sock.sendMessage(from, { text: `🛒 *RPG SHOP*\n\n1. Potion - 100 Gold\nKetik: *${p}buy potion*` })
      }

      /* ================= HEAL ================= */
      if (cmd === 'heal') {
        if (user.potion < 1) return sock.sendMessage(from, { text: '❌ Kamu tidak punya Potion. Beli di shop.' })
        if (user.health >= 100) return sock.sendMessage(from, { text: '❤️ Darahmu masih penuh.' })
        
        user.potion -= 1
        user.health = 100
        saveDB(rpg)
        await sock.sendMessage(from, { react: { text: '🧪', key: msg.key } })
        return sock.sendMessage(from, { text: '💊 Darah berhasil dipulihkan!' }, { quoted: msg })
      }

    } catch (e) {
      console.error(e)
    }
  }
}

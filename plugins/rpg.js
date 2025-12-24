const fs = require('fs')
const path = require('path')
const { reply } = require('../lib/util')

/* ================= FILE DATABASE ================= */
const dbPath = path.join(__dirname, '../database/rpg.json')

function loadDB() {
  if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, '{}')
  return JSON.parse(fs.readFileSync(dbPath))
}

function saveDB(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2))
}

let rpg = loadDB()

/* ================= USER INIT ================= */
function getUser(jid) {
  if (!rpg[jid]) {
    rpg[jid] = {
      level: 1,
      exp: 0,
      gold: 0,
      health: 100,
      potion: 1
    }
    saveDB(rpg)
  }
  return rpg[jid]
}

function levelUp(user) {
  const need = user.level * 100
  if (user.exp >= need) {
    user.level++
    user.exp = 0
    user.health = 100
    return true
  }
  return false
}

module.exports = {
  command: [
    'rpgmenu',
    'status',
    'hunt',
    'adventure',
    'heal',
    'inventory'
  ],

  run: async ({ sock, msg, from }) => {
    const body =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      ''

    const sender = msg.key.participant || msg.key.remoteJid
    const cmd = body.slice(1).split(' ')[0].toLowerCase()
    const user = getUser(sender)

    /* ================= MENU ================= */
    if (cmd === 'rpgmenu') {
      return reply(
        sock,
        from,
`🗡️ *RPG MENU*

• .status
• .hunt
• .adventure
• .heal
• .inventory`,
        msg
      )
    }

    /* ================= STATUS ================= */
    if (cmd === 'status') {
      return reply(
        sock,
        from,
`📊 *STATUS RPG*

Level : ${user.level}
EXP   : ${user.exp}/${user.level * 100}
Gold  : ${user.gold}
Health: ${user.health}
Potion: ${user.potion}`,
        msg
      )
    }

    /* ================= HUNT ================= */
    if (cmd === 'hunt') {
      if (user.health <= 0) {
        return reply(sock, from, '💀 Kamu kehabisan darah\nGunakan .heal', msg)
      }

      const exp = Math.floor(Math.random() * 30) + 10
      const gold = Math.floor(Math.random() * 50) + 10
      const dmg = Math.floor(Math.random() * 20) + 5

      user.exp += exp
      user.gold += gold
      user.health -= dmg

      const up = levelUp(user)
      saveDB(rpg)

      return reply(
        sock,
        from,
`🏹 *HUNT BERHASIL*

+EXP   : ${exp}
+Gold  : ${gold}
-Darah : ${dmg}
${up ? '🎉 LEVEL UP!' : ''}`,
        msg
      )
    }

    /* ================= ADVENTURE ================= */
    if (cmd === 'adventure') {
      if (user.health < 30) {
        return reply(sock, from, '⚠️ Darah terlalu rendah\nGunakan .heal', msg)
      }

      const win = Math.random() > 0.4
      if (!win) {
        user.health -= 30
        saveDB(rpg)
        return reply(sock, from, '💥 Kamu kalah\n-Darah 30', msg)
      }

      const exp = 80
      const gold = 100
      user.exp += exp
      user.gold += gold

      const up = levelUp(user)
      saveDB(rpg)

      return reply(
        sock,
        from,
`⚔️ *ADVENTURE SUKSES*

+EXP  : ${exp}
+Gold : ${gold}
${up ? '🔥 LEVEL UP!' : ''}`,
        msg
      )
    }

    /* ================= HEAL ================= */
    if (cmd === 'heal') {
      if (user.potion <= 0) {
        return reply(sock, from, '❌ Potion habis', msg)
      }

      user.potion--
      user.health = 100
      saveDB(rpg)

      return reply(sock, from, '💊 Darah pulih penuh', msg)
    }

    /* ================= INVENTORY ================= */
    if (cmd === 'inventory') {
      return reply(
        sock,
        from,
`🎒 *INVENTORY*

Potion : ${user.potion}
Gold   : ${user.gold}`,
        msg
      )
    }
  }
}
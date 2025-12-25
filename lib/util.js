/**
 * UTILITY LIBRARY - lib/util.js
 * Berisi fungsi pembantu untuk pengecekan otoritas dan manipulasi pesan.
 */

const isAdmin = async (sock, from, sender) => {
  try {
    const metadata = await sock.groupMetadata(from)
    const participants = metadata.participants
    const user = participants.find(p => p.id === sender)
    return user && (user.admin === 'admin' || user.admin === 'superadmin')
  } catch (e) {
    return false
  }
}

const isOwner = (sender, ownerList) => {
  // Membersihkan JID menjadi nomor saja
  const number = sender.split('@')[0].split(':')[0]
  return ownerList.includes(number)
}

const reply = (sock, from, text, msg) => {
  return sock.sendMessage(from, { text: text }, { quoted: msg })
}

// Fungsi untuk mengecek apakah pesan dikirim di grup
const isGroup = (from) => {
  return from.endsWith('@g.us')
}

module.exports = {
  isAdmin,
  isOwner,
  reply,
  isGroup
}

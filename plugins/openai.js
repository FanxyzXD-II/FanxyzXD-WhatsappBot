const OpenAI = require('openai')

module.exports = {
  command: [
    'openai',
    'ai',
    'ask'
  ],

  run: async ({ sock, msg, from, args, config }) => {
    // Mengambil teks dari berbagai tipe pesan
    const body =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      msg.message.imageMessage?.caption ||
      ''

    const cmd = body.slice(config.prefix.length).trim().split(/ +/)[0].toLowerCase()
    const text = args.join(' ')

    // Inisialisasi OpenAI secara lokal agar tidak bentrok jika config berubah
    const openai = new OpenAI({
      apiKey: config.OPENAI_KEY || 'YOUR_OPENAI_API_KEY'
    })

    /* ================= MENU BANTUAN ================= */
    if (!text) {
      const menuText = `🤖 *AI ASSISTANT MENU*

• *${config.prefix}ai* <pertanyaan>
• *${config.prefix}ask* <pertanyaan>

_Contoh: ${config.prefix}ai cara memasak nasi goreng_`
      
      return sock.sendMessage(from, { text: menuText }, { quoted: msg })
    }

    try {
      // Memberikan reaksi agar user tahu bot merespon
      await sock.sendMessage(from, { react: { text: '🧠', key: msg.key } })

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini', // Menggunakan model terbaru yang efisien
        messages: [
          {
            role: 'system',
            content: 'Kamu adalah FanxyzXD AI, asisten WhatsApp yang cerdas, ramah, dan ringkas dalam menjawab.'
          },
          {
            role: 'user',
            content: text
          }
        ],
        max_tokens: 1000 // Membatasi agar tidak terlalu panjang
      })

      const result = completion.choices[0].message.content

      // Kirim hasil akhir
      await sock.sendMessage(from, { 
        text: `🤖 *AI RESPONSE*\n\n${result.trim()}` 
      }, { quoted: msg })

      // Reaksi selesai
      await sock.sendMessage(from, { react: { text: '✅', key: msg.key } })

    } catch (err) {
      console.error('OpenAI Error:', err)
      
      // Memberikan feedback error yang jelas ke user
      let errorMessage = '❌ Terjadi kesalahan pada layanan AI.'
      if (err.status === 401) errorMessage = '❌ API Key OpenAI tidak valid atau belum diset.'
      if (err.status === 429) errorMessage = '❌ Kuota API OpenAI telah habis atau limit tercapai.'

      await sock.sendMessage(from, { react: { text: '❌', key: msg.key } })
      return sock.sendMessage(from, { text: errorMessage }, { quoted: msg })
    }
  }
}

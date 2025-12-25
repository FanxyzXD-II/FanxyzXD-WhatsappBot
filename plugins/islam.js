const axios = require('axios')

module.exports = {
  command: [
    'islam',
    'jadwalsholat',
    'sholat',
    'alquran',
    'quran',
    'doaharian',
    'doa'
  ],

  run: async ({ sock, msg, from, args, config }) => {
    const body =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      msg.message.imageMessage?.caption ||
      ''

    const cmd = body.slice(config.prefix.length).trim().split(/ +/)[0].toLowerCase()

    try {
      /* ================= MENU ISLAM ================= */
      if (cmd === 'islam') {
        const menuText = `☪ *ISLAMIC MENU*

• *${config.prefix}jadwalsholat* <kota>
• *${config.prefix}alquran* <nomor_surah>
• *${config.prefix}doaharian*

_Contoh:_
_${config.prefix}jadwalsholat Jakarta_
_${config.prefix}alquran 1_`
        
        return sock.sendMessage(from, { text: menuText }, { quoted: msg })
      }

      /* ================= JADWAL SHOLAT ================= */
      if (cmd === 'jadwalsholat' || cmd === 'sholat') {
        if (!args[0]) {
          return sock.sendMessage(from, { text: `❗ Masukkan nama kota!\nContoh: *${config.prefix}sholat Jakarta*` }, { quoted: msg })
        }

        await sock.sendMessage(from, { react: { text: '🕌', key: msg.key } })
        const kota = args.join(' ')
        
        // Menggunakan API Aladhan dengan parameter yang dioptimalkan
        const res = await axios.get(`https://api.aladhan.com/v1/timingsByCity`, {
          params: {
            city: kota,
            country: 'Indonesia',
            method: 11 // Kemenag RI
          }
        })

        const data = res.data.data
        if (!data) throw new Error('City not found')

        const t = data.timings
        const date = data.date
        
        const caption = `🕌 *JADWAL SHOLAT*

📍 *Kota:* ${kota}
📅 *Tanggal:* ${date.readable}
🌙 *Hijri:* ${date.hijri.day} ${date.hijri.month.en} ${date.hijri.year}

• Imsak   : ${t.Imsak}
• Subuh   : ${t.Fajr}
• Terbit  : ${t.Sunrise}
• Dzuhur  : ${t.Dhuhr}
• Ashar   : ${t.Asr}
• Maghrib : ${t.Maghrib}
• Isya    : ${t.Isha}`

        return sock.sendMessage(from, { text: caption }, { quoted: msg })
      }

      /* ================= AL-QURAN ================= */
      if (cmd === 'alquran' || cmd === 'quran') {
        const noSurah = parseInt(args[0])
        if (!noSurah || noSurah < 1 || noSurah > 114) {
          return sock.sendMessage(from, { text: `❗ Masukkan nomor Surah (1-114)!\nContoh: *${config.prefix}quran 1*` }, { quoted: msg })
        }

        await sock.sendMessage(from, { react: { text: '📖', key: msg.key } })

        // Mengambil data surah (Arab + Latin + Terjemahan ID)
        const res = await axios.get(`https://api.alquran.cloud/v1/surah/${noSurah}/id.indonesian`)
        const surah = res.data.data

        let teks = `📖 *SURAH ${surah.englishName.toUpperCase()}*
(${surah.name} - ${surah.englishNameTranslation})
✨ *Jumlah Ayat:* ${surah.numberOfAyahs}
--------------------------------------------\n\n`

        // Mengambil 5 ayat pertama agar tidak terlalu panjang (Limit WhatsApp Chat)
        const limitAyah = surah.ayahs.slice(0, 5)
        limitAyah.forEach((a, i) => {
          teks += `*Ayat ${i + 1}:*\n${a.text}\n_(Artinya: ${a.text})_\n\n`
        })

        teks += `_... (Gunakan aplikasi Al-Qur'an untuk bacaan lengkap)_`

        return sock.sendMessage(from, { text: teks }, { quoted: msg })
      }

      /* ================= DOA HARIAN ================= */
      if (cmd === 'doaharian' || cmd === 'doa') {
        await sock.sendMessage(from, { react: { text: '🤲', key: msg.key } })

        // API Doa (Menggunakan fallback jika API utama gangguan)
        const res = await axios.get('https://islamic-api-zhirrr.vercel.app/api/doaharian').catch(() => null)
        
        if (!res || !res.data.data) {
          return sock.sendMessage(from, { text: '❌ Layanan doa sedang gangguan, coba lagi nanti.' }, { quoted: msg })
        }

        const listDoa = res.data.data
        const randomDoa = listDoa[Math.floor(Math.random() * listDoa.length)]

        const doaCaption = `🤲 *${randomDoa.title}*\n\n${randomDoa.arabic}\n\n*Artinya:* \n_"${randomDoa.translation}"_`

        return sock.sendMessage(from, { text: doaCaption }, { quoted: msg })
      }

    } catch (e) {
      console.error('Islam Plugin Error:', e)
      await sock.sendMessage(from, { react: { text: '❌', key: msg.key } })
      return sock.sendMessage(from, { text: '❌ Terjadi kesalahan dalam mengambil data. Pastikan input benar.' }, { quoted: msg })
    }
  }
}

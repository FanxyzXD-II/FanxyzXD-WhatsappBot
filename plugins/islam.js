const { reply } = require('../lib/util')

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

  run: async ({ sock, msg, from, args }) => {
    const body =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      ''

    const cmd = body.slice(1).split(' ')[0].toLowerCase()

    /* ================= MENU ISLAM ================= */
    if (cmd === 'islam') {
      return reply(
        sock,
        from,
`☪ *ISLAM MENU*

• .jadwalsholat kota
• .alquran nomor_surat
• .doaharian

Contoh:
.jadwalsholat jakarta
.alquran 1`,
        msg
      )
    }

    /* ================= JADWAL SHOLAT ================= */
    if (cmd === 'jadwalsholat' || cmd === 'sholat') {
      if (!args[0]) {
        return reply(
          sock,
          from,
          '❗ Contoh: .jadwalsholat jakarta',
          msg
        )
      }

      const kota = args.join(' ')
      try {
        // API Aladhan (tanpa key)
        const res = await fetch(
          `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(
            kota
          )}&country=Indonesia&method=11`
        )
        const json = await res.json()

        if (!json.data) {
          return reply(sock, from, '❌ Kota tidak ditemukan', msg)
        }

        const t = json.data.timings
        const tanggal = json.data.date.readable

        return reply(
          sock,
          from,
`🕌 *JADWAL SHOLAT*
📍 Kota: ${kota}
📅 Tanggal: ${tanggal}

• Subuh  : ${t.Fajr}
• Dzuhur : ${t.Dhuhr}
• Ashar  : ${t.Asr}
• Maghrib: ${t.Maghrib}
• Isya   : ${t.Isha}`,
          msg
        )
      } catch (e) {
        return reply(sock, from, '❌ Gagal mengambil jadwal sholat', msg)
      }
    }

    /* ================= AL-QURAN ================= */
    if (cmd === 'alquran' || cmd === 'quran') {
      const nomor = parseInt(args[0])
      if (!nomor || nomor < 1 || nomor > 114) {
        return reply(
          sock,
          from,
          '❗ Contoh: .alquran 1 (1–114)',
          msg
        )
      }

      try {
        const res = await fetch(
          `https://api.alquran.cloud/v1/surah/${nomor}`
        )
        const json = await res.json()

        const s = json.data

        let teks =
`📖 *SURAT ${s.englishName.toUpperCase()}*
(${s.name})
Ayat: ${s.numberOfAyahs}

`

        // kirim ringkas (5 ayat pertama)
        s.ayahs.slice(0, 5).forEach(a => {
          teks += `${a.text}\n\n`
        })

        teks += '…\n\nGunakan aplikasi Al-Qur’an untuk bacaan lengkap.'

        return reply(sock, from, teks, msg)
      } catch (e) {
        return reply(sock, from, '❌ Gagal mengambil Al-Qur’an', msg)
      }
    }

    /* ================= DOA HARIAN ================= */
    if (cmd === 'doaharian' || cmd === 'doa') {
      try {
        const res = await fetch(
          'https://islamic-api-zhirrr.vercel.app/api/doaharian'
        )
        const json = await res.json()

        const doa = json.data[Math.floor(Math.random() * json.data.length)]

        return reply(
          sock,
          from,
`🤲 *${doa.title}*

${doa.arabic}

Artinya:
${doa.translation}`,
          msg
        )
      } catch (e) {
        return reply(sock, from, '❌ Gagal mengambil doa', msg)
      }
    }
  }
}
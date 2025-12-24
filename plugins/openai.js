const OpenAI = require('openai')
const { reply } = require('../lib/util')
const config = require('../config')

const openai = new OpenAI({
  apiKey: config.OPENAI_KEY
})

module.exports = {
  command: [
    'openai',
    'ai',
    'ask'
  ],

  run: async ({ sock, msg, from, args }) => {
    const body =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      ''

    const cmd = body.slice(1).split(' ')[0].toLowerCase()
    const text = args.join(' ')

    /* ================= MENU ================= */
    if (!text) {
      return reply(
        sock,
        from,
`🤖 *OPENAI MENU*

• .ai <pertanyaan>
• .ask <pertanyaan>

Contoh:
.ai jelaskan black hole`,
        msg
      )
    }

    try {
      reply(sock, from, '⏳ AI sedang berpikir...', msg)

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Kamu adalah asisten WhatsApp yang ramah dan membantu.'
          },
          {
            role: 'user',
            content: text
          }
        ]
      })

      const result = completion.choices[0].message.content

      return reply(
        sock,
        from,
`🤖 *OPENAI RESPONSE*

${result}`,
        msg
      )
    } catch (err) {
      console.error(err)
      return reply(sock, from, '❌ Terjadi error pada OpenAI', msg)
    }
  }
}
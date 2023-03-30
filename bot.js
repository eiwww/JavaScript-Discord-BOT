require('dotenv').config()
const cron = require('node-cron')
const { Client, GatewayIntentBits  } = require('discord.js')
const client = new Client({ 
  intents:[
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages ,
    GatewayIntentBits.MessageContent
  ] 
})
const openai = require('openai')
const openai_key = process.env.OPENAI_KEY
const discord_key = process.env.DISCORD_KEY
const prefix = '|' // define your prefix here
const { ask } = require('./ai')

openai.api_key = openai_key

let previousResponse = []

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`)

  cron.schedule('* * 6 * * *', async () => {
    const channel = client.channels.cache.find(ch => ch.id === process.env.BOT_ROOM_ID)
    await channel.send('https://media.tenor.com/A_NVrvFq7VUAAAAC/nakiri-ayame-ojou.gif')
    await channel.send('my memories is fading what was the question again?')
    previousResponse = []
    console.log('Clear Previouse Respone')
  })
})

client.on('messageCreate', async (message) => {
  try {
    //check if it's prefix for this bot
    if (!message.content.startsWith(prefix) || message.author.bot) return
    
    //get command text
    const args = message.content.slice(prefix.length).trim().split(/ +/)
    const command = args.shift().toLowerCase()

    if(command === 'ping'){
      console.log('pong')
      await message.channel.send('Pong!')
    }

    if(command === 'eiwww'){
      console.log('Fak You')
      await message.channel.send('Fak You')
    }

    if(command === 'ojou'){
      //ignore if it's a bot
      if(message.author.bot) return

      await message.channel.send(`Let me think, I will answer you soon!`).then(sentMessage => {
        setTimeout(() => {
          // Delete the message
          sentMessage.delete();
        }, 20000);
        // sentMessage.delete({timeout:"10000"})
      })

      //set user ID that send msg
      const userId = message.author.id

      //set question to ask ai
      let prompt = message.content.substring(6)
      console.log('Question: '+ prompt)

      //push question to previous talking
      const checkUser = previousResponse.find(obj => obj.userId === userId)
      if(checkUser){
        checkUser.msg.push({ role: 'user', content: prompt })
      }else{
        previousResponse.push({ userId: message.author.id, msg: [{ role: 'user', content: prompt }] })
      }

      //fliter context to ask ai by user ID
      let context = previousResponse.filter((res) => {
        return res.userId === userId
      }).map((selected) => selected.msg)

      //using chat gpt and send answer
      const answer = await ask(context[0])
      let answerObj = JSON.parse(JSON.stringify(answer))
      await message.channel.send(`<@${message.author.id}>\n` + answerObj.content)

      //push answer to previous talking to continue talk
      if(checkUser){
        checkUser.msg.push({ role: 'assistant', content: answerObj.content })
      }else{
        let pvRes = previousResponse.find(obj => obj.userId === userId)
        pvRes.msg.push({ role: 'assistant', content: answerObj.content })
      }
      console.log('Answer: '+ answerObj.content)
    }

    if(command === "thx"){
      //ignore if it's a bot
      if(message.author.bot) return

      //set user ID that send msg
      const userId = message.author.id

      previousResponse = previousResponse.filter(item => item.userId !== userId)

      await message.channel.send("https://tenor.com/view/nakiriayame-ayame-ayamelfr-lfrhahaha-gif-19358266")
      await message.channel.send("you are very welcome! Ask away! if you need anything else")
    }

    if(command === "forget"){
      //ignore if it's a bot
      if(message.author.bot) return

      previousResponse = []

      await message.channel.send("https://media.tenor.com/kE-l_OaKS4MAAAAd/ayame-confused.gif")
      await message.channel.send("my memories is fading what was the question again?")
    }
  } catch (error) {
    console.log(error)
    await message.channel.send(`I'm Broken Sorry Can't Answer That <@${message.author.id}>`)
  }
})

client.login(discord_key)
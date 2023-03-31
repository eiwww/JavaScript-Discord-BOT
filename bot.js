require('dotenv').config()
const cron = require('node-cron')
const { Client, GatewayIntentBits, Collection, Events, EmbedBuilder } = require('discord.js')
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
// const fs = require('fs')
// const path = require('path')

openai.api_key = openai_key

// client.commands = new Collection()

// const commandsPath = path.join(__dirname, 'commands')
// const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))

// for(const file of commandFiles) {
//   const filePath = path.join(commandsPath, file)
//   const command = require(filePath)
//   // Set a new item in the Collection with the key as the command name and the value as the exported module
// 	if ('data' in command && 'execute' in command) {
// 		client.commands.set(command.data.name, command);
// 	} else {
// 		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
// 	}
// }

let previousResponse = []

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`)

  // cron.schedule(''0 6 * * *'', async () => {
  //   const channel = client.channels.cache.find(ch => ch.id === process.env.BOT_ROOM_ID)
  //   await channel.send('https://media.tenor.com/A_NVrvFq7VUAAAAC/nakiri-ayame-ojou.gif')
  //   await channel.send('my memories is fading what was the question again?')
  //   previousResponse = []
  //   console.log('Clear Previouse Respone')
  // })
})

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return

	if(interaction.commandName === 'ping'){
    // interaction.reply('Pong!')
    const embed = new EmbedBuilder()
      .setColor(0xFF0099)
      .setTitle('PHRNG!🏓')
      .setDescription(`Latency · ${Date.now() - interaction.createdTimestamp}ms\nYour Ping · ${Math.round(client.ws.ping)}ms`)
    interaction.reply({ embeds: [embed] });
  }

  if(interaction.commandName === 'eiwww'){
    const embed = new EmbedBuilder()
      .setColor(0xFF0099)
      .setTitle(`Fak U`)
      .setImage('https://media.tenor.com/HnN1M0hxu_8AAAAM/sakura-miko-sakura-miko-faq.gif')

    interaction.reply({content:`<@${interaction.user.id}>`, embeds: [embed] })
  }

  if(interaction.commandName === 'ojou'){
    try {
      await interaction.reply(`Let me think, I will answer you soon!`)

      //set user ID that send msg
      const userId = interaction.user.id

      //set question to ask ai
      let prompt = interaction.options.get('question').value
      console.log('Question: '+ prompt)

      //push question to previous talking
      const checkUser = previousResponse.find(obj => obj.userId === userId)
      if(checkUser){
        checkUser.msg.push({ role: 'user', content: prompt })
      }else{
        previousResponse.push({ userId: userId, msg: [{ role: 'user', content: prompt }] })
      }

      //fliter context to ask ai by user ID
      let context = previousResponse.filter((res) => {
        return res.userId === userId
      }).map((selected) => selected.msg)

      //using chat gpt and send answer
      const answer = await ask(context[0])
      let answerObj = JSON.parse(JSON.stringify(answer))
      await interaction.channel.send(`<@${userId}>\nQuestion:\n> ${prompt}\nAnswer:\n> ${answerObj.content}`)
      await interaction.deleteReply()
      // const embed = new EmbedBuilder()
      //   .setColor(0xFF0099)
      //   .setTitle(prompt)
      //   .setDescription(answerObj.content)
      // interaction.reply({ embeds: [embed] });

      //push answer to previous talking to continue talk
      if(checkUser){
        checkUser.msg.push({ role: 'assistant', content: answerObj.content })
      }else{
        let pvRes = previousResponse.find(obj => obj.userId === userId)
        pvRes.msg.push({ role: 'assistant', content: answerObj.content })
      }
      console.log('Answer: '+ answerObj.content)
    } catch (error) {
      console.log(error)
      await interaction.channel.send(`<@${userId}>\nQuestion:\n> ${prompt}\nAnswer:\n> Sorry I got error can't answer that`)
      // await interaction.channel.send(`\n-------<@${userId}> Question-------\n`+ prompt +`\n-------Answer-------\nSorry I got error can't answer that`)
      await interaction.deleteReply()
    }
  }

  if(interaction.commandName === "thx"){
    //set user ID that send msg
    const userId = interaction.user.id

    previousResponse = previousResponse.filter(item => item.userId !== userId)

    // inside a command, event listener, etc.
    const embed = new EmbedBuilder()
      .setColor(0xFF0099)
      .setTitle('Thanks For Asking')
      .setDescription('you are very welcome! Ask away! if you need anything else')
      .setImage('https://media.tenor.com/ynzYrPZC0tcAAAAC/hologra-hololive.gif')


    await interaction.reply({ embeds: [embed] })
  }

  if(interaction.commandName === "forget"){
    previousResponse = []

    // inside a command, event listener, etc.
    const embed = new EmbedBuilder()
      .setColor(0xFF0099)
      .setTitle('Clear My Memoriess')
      // .setURL('https://discord.js.org/')
      // .setAuthor({ name: 'Some name', iconURL: 'https://i.imgur.com/AfFp7pu.png', url: 'https://discord.js.org' })
      .setDescription('my memories is fading what was the question again?')
      // .setThumbnail('https://i.imgur.com/AfFp7pu.png')
      // .addFields(
      //   { name: 'Regular field title', value: 'Some value here' },
      //   { name: '\u200B', value: '\u200B' },
      //   { name: 'Inline field title', value: 'Some value here', inline: true },
      //   { name: 'Inline field title', value: 'Some value here', inline: true },
      // )
      // .addFields({ name: 'Inline field title', value: 'Some value here', inline: true })
      .setImage('https://media.tenor.com/kE-l_OaKS4MAAAAd/ayame-confused.gif')
      // .setTimestamp()
      // .setFooter({ text: 'Some footer text here', iconURL: 'https://i.imgur.com/AfFp7pu.png' });


    await interaction.reply({ embeds: [embed] })
  }

  if(interaction.commandName === "clearmsg"){
    try {
      let amount = parseInt(interaction.options.get('amount').value)
      
      if(amount <= 0 || amount > 100){
        await interaction.reply('Pleasee Input Number of Message to delete between 1-100')
        return
      }

      interaction.channel.bulkDelete(amount)

      await interaction.reply(`Delete ${amount} Message complete`)
    } catch (error) {
      console.log(error)
      await interaction.editReply(`Can Not Delete Message Got ERROR`)
    }
  }
})

// client.on('messageCreate', async (message) => {
//   try {
//     //check if it's prefix for this bot
//     if (!message.content.startsWith(prefix) || message.author.bot) return
    
//     //get command text
//     const args = message.content.slice(prefix.length).trim().split(/ +/)
//     const command = args.shift().toLowerCase()

//     if(command === 'ping'){
//       console.log('pong')
//       await message.channel.send('Pong!')
//     }

//     if(command === 'eiwww'){
//       console.log('Fak You')
//       await message.channel.send(`Fak U <@${message.author.id}>`)
//     }

//     if(command === 'ojou'){
//       //ignore if it's a bot
//       if(message.author.bot) return

//       await message.channel.send(`Let me think, I will answer you soon!`).then(async (sentMessage) => {
//         // setTimeout(() => {
//         //   // Delete the message
//         //   sentMessage.delete();
//         // }, 20000);
//         // sentMessage.delete({timeout:"10000"})
//         //set user ID that send msg
//         const userId = message.author.id

//         //set question to ask ai
//         let prompt = message.content.substring(6)
//         console.log('Question: '+ prompt)

//         //push question to previous talking
//         const checkUser = previousResponse.find(obj => obj.userId === userId)
//         if(checkUser){
//           checkUser.msg.push({ role: 'user', content: prompt })
//         }else{
//           previousResponse.push({ userId: message.author.id, msg: [{ role: 'user', content: prompt }] })
//         }

//         //fliter context to ask ai by user ID
//         let context = previousResponse.filter((res) => {
//           return res.userId === userId
//         }).map((selected) => selected.msg)

//         //using chat gpt and send answer
//         const answer = await ask(context[0])
//         let answerObj = JSON.parse(JSON.stringify(answer))
//         await sentMessage.edit(`<@${message.author.id}>\n` + answerObj.content)

//         //push answer to previous talking to continue talk
//         if(checkUser){
//           checkUser.msg.push({ role: 'assistant', content: answerObj.content })
//         }else{
//           let pvRes = previousResponse.find(obj => obj.userId === userId)
//           pvRes.msg.push({ role: 'assistant', content: answerObj.content })
//         }
//         console.log('Answer: '+ answerObj.content)
//       }).catch(() => {

//       })
//     }

//     if(command === "thx"){
//       //ignore if it's a bot
//       if(message.author.bot) return

//       //set user ID that send msg
//       const userId = message.author.id

//       previousResponse = previousResponse.filter(item => item.userId !== userId)

//       await message.channel.send("https://tenor.com/view/nakiriayame-ayame-ayamelfr-lfrhahaha-gif-19358266")
//       await message.channel.send("you are very welcome! Ask away! if you need anything else")
//     }

//     if(command === "forget"){
//       //ignore if it's a bot
//       if(message.author.bot) return

//       previousResponse = []

//       await message.channel.send("https://media.tenor.com/kE-l_OaKS4MAAAAd/ayame-confused.gif")
//       await message.channel.send("my memories is fading what was the question again?")
//     }
//   } catch (error) {
//     console.log(error)
//     await message.channel.send(`I'm Broken Sorry Can't Answer That <@${message.author.id}>`)
//   }
// })

client.login(discord_key)
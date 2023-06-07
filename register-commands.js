require("dotenv").config();
const { REST, Routes, ApplicationCommandOptionType } = require("discord.js");

const commands = [
  {
    name: "ping",
    description: "Reply With Ping",
  },
  {
    name: "eiwww",
    description: "Just say Fak U",
  },
  // {
  //   name: "ojou",
  //   description: "Ask Ojou What you want",
  //   options:[
  //       {
  //           name: 'question',
  //           description: 'question to ask ojou',
  //           type: ApplicationCommandOptionType.String,
  //           required: true,
  //         },
  //   ]
  // },
  {
    name: "thx",
    description: "Clear cache for your session from using Ojou",
  },
  {
    name: "forget",
    description: "Clear all cache from using Ojou",
  },
  {
    name: "clearmsg",
    description: "Clear Message by number from 1-100",
    options:[
        {
            name: 'amount',
            description: 'Amount NUmber of Message to Delete',
            type: ApplicationCommandOptionType.Integer,
            required: true,
          },
    ]
  },
];

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_KEY);
(async () => {
  try {
    console.log("Register Command.....");

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: commands }
    );

    console.log("Register Commnad Successful");
  } catch (error) {
    console.log("Register command error: " + error);
  }
})();

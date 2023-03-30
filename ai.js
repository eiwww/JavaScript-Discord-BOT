require('dotenv').config()

const { Configuration, OpenAIApi } = require('openai')
const configuration = new Configuration({
  apiKey: process.env.OPENAI_KEY,
})
const openai = new OpenAIApi(configuration)
async function ask(prompt) {
  const response = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: prompt,
    temperature: 0.4,
    max_tokens: 300,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  })
  const answer = response.data.choices[0].message
  return answer
}
//Export the 'ask' function
module.exports = {
  ask,
}

const mongoose = require('mongoose');
require('dotenv').config();

const webMongoURL = process.env.WEB_MONGO_URL;
const chatbotMongoURL = process.env.CHATBOT_MONGO_URL;

const connectWebDB = async () => {
  try {
    await mongoose.connect(webMongoURL);
    console.log("Connected to the 'wat' database");
  } catch (error) {
    console.error("Error connecting to the 'wat' database:", error);
  }
};

const chatbotConnection = mongoose.createConnection(chatbotMongoURL);

chatbotConnection.on('connected', () => {
  console.log("Connected to the 'alex-chatbot' database");
});

chatbotConnection.on('error', (error) => {
  console.error("Error connecting to the 'alex-chatbot' database:", error);
});

module.exports = { connectWebDB, chatbotConnection };


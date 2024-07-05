const axios = require('axios');
const Message = require('../models/Message');

exports.sendMessage = async (req, res) => {
  const { message } = req.body;
  try {
    const response = await axios.post('http://localhost:5001/chat', { message });
    const newMessage = new Message({ message: response.data.response });
    await newMessage.save();
    res.json({ response: response.data.response });
  } catch (error) {
    res.status(500).send('Server Error');
  }
};

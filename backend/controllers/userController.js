const { dbConnection } = require("../server");

const getUserData = async (req, res) => {
  try {
    const db = await dbConnection();
    const ip = req.params.ip; // Assuming username is passed as a parameter in the URL

    // Retrieve data based on the username
    const userData = await db.collection('userEvents').findOne({
      'userInfo.ip': ip,
    });

    if (userData) {
      res.status(200).json([userData]);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    console.error('Error retrieving data by username from MongoDB:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


const anonymousUser = async(req, res) => {
  try {
    const db = await dbConnection();
    const uniqueIdentifier = generateUniqueIdentifier();

    await db.collection('users').insertOne({uniqueIdentifier});

    res.status(201).json({uniqueIdentifier});


  } catch (error) {
    console.error("Error generating unique identifier:", error);
    res.status(500).json({error : "internal server error"});
  }

  function generateUniqueIdentifier() {
    return `user_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
  }
}


module.exports = { getUserData ,anonymousUser};


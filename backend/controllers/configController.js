const { dbConnection } = require("../server");

const config = async(req, res) =>{

    const db = await dbConnection();
    const userData = req.body;
    const configData = {
        endpoint: 'https://webanalyticals.onrender.com',
        serverUpdateTime: 5000,
        token: '',
    };
    try {
      
        const collection = db.collection('userInfo')
        const response = {
            ...userData,
            ...configData,
          };
          await collection.insertOne(response);

        res.json(response);
    } catch (error) {
        console.error('Error craeting config:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}
module.exports = { config};

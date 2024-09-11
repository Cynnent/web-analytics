const MapData = require("../models/wat_mapData");

const mapData = async (socket, locationInfoJson) => {
  try {
      const locationinfo = JSON.parse(locationInfoJson);

      const { _id, clientName, latitude, longitude, country, cityName } = locationinfo;

      const newMapData = new MapData({
        _id,
        clientName,
        latitude,
        longitude,
        country,
        cityName,
      });

   await newMapData.save().then((res) => console.log(res)).catch((err) => console.log(err))
  } catch (error) {
    console.error('Error creating mapdata:', error.message);
  }
};



const getAllMapData = async (req, res) => {
  try {
    const client = req.params.clientName;
    const allUserMapData = await MapData.find({ clientName: client });
    if (allUserMapData.length === 0) {
      return res.json({
        message: `No data found for the client name: ${client}.`,
      });
    }

    return res.status(200).json(allUserMapData);
  } catch (error) {
    console.error("Error creating mapdata:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const usersByCountry = async (req, res) => {
  try {
    const client = req.params.clientName;

    const result = await MapData.aggregate([
      { $match: { 'clientName': client } },
      { $group: { _id: { country: '$country', city: '$cityName' }, users: { $sum: 1 } } },
      { $project: { _id: 0, cityName: '$_id.city', users: 1, country: '$_id.country' } }
    ]);

    res.json(result);
  } catch (error) {
    console.error('Error processing user per city data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = { mapData, getAllMapData, usersByCountry };

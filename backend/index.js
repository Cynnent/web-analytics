const express = require('express')
const bodyParser = require('body-parser');
const { dbConnection } = require('./server');
const cors = require('cors');
const { updateData, user, getUsersData } = require('./controllers/wat_updateController');
const { screenCount, mostViewedPage } = require('./controllers/wat_mostViewed');
const { mostClickedActions } = require('./controllers/wat_mostClicked');
const { mapData, getAllMapData, usersByCountry } = require('./controllers/wat_mapDataController');
const { saveDeviceData, getAllUserDeviceData, mostUsedDevices } = require('./controllers/wat_deviceDataController');
const { clientData, getUsersByClientName } = require('./controllers/wat_dashboardController');
const { getUserEvents, dateFilter, getweeklyData, getmonthlyData } = require('./controllers/wat_dateController');
const { createQuestions, getQuestions } = require('./controllers/botControllers/bot_questionsController');
const { createOffers, getOffers } = require('./controllers/botControllers/bot_offersController');
const { createAnimations, getAnimations } = require('./controllers/botControllers/bot_animationsController');

const app = express();
const port = 3000;

//Middleware
app.use(bodyParser.json());
app.use(cors()); 

//Database connection
dbConnection()

//main api 
app.post('/config', user) 
app.post('/updateUserEvents/:userId', updateData)  
app.get('/getUsersData', getUsersData)

//admin page charts data collection api
app.get('/screenCount', screenCount)
app.get('/mostViewedPages/:clientName', mostViewedPage)
app.get('/mostClickedActions/:clientName', mostClickedActions)
app.get('/mostUsedDevices/:clientName', mostUsedDevices)
app.get('/usersByCountry/:clientName', usersByCountry)

//new development
app.post('/saveMapData',mapData)
app.get('/getAllMapData/:clientName', getAllMapData)

app.post('/saveDeviceData',saveDeviceData)
app.get('/getAllDeviceData/:clientName', getAllUserDeviceData)
  
app.get('/getAllClients',clientData);
app.get('/getUsersByClientName/:clientName', getUsersByClientName)

//date  
app.get('/getDates/:userId', dateFilter)
app.get('/getUserEvents/:userId/:date', getUserEvents)
app.get('/getWeeklyData/:userId', getweeklyData)
app.get('/getMonthlyData/:userId', getmonthlyData)

//Chat-Bot
app.post('/chatBot/questions/:clientName', createQuestions);
app.post('/chatBot/offers/:clientName',createOffers);
app.post('/chatBot/animations/:clientName',createAnimations);

app.get('/chatBot/getoffers/:clientName', getOffers);
app.get('/chatBot/getQuestions/:clientName', getQuestions);
app.get('/chatBot/getAnimations/:clientName', getAnimations);

app.listen(port, () => {
  console.log(`Server is running on localhost:${port}`);
});

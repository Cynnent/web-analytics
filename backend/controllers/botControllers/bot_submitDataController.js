const SubmitData = require("../../models/botModels/bot_submitDataModel");

const submitData = async(req, res) =>{
    const {clientName} = req.params;
    const { questions, offers, animations } = req.body;
    try {
        const clientData = await SubmitData.findOne({ clientName });
        if (!clientData) {
            clientData  = new SubmitData({
                clientName,
                questions,
                offers,
                animations
            });
        } 
        else {
            if (questions) clientData.questions = [...clientData.questions, ...questions];
            if (offers) clientData.offers = [...clientData.offers, ...offers];
            if (animations) clientData.animations = [...clientData.animations, ...animations];
        }
        await clientData.save();
        return res.status(200).json(clientData);
    } catch (error) {
        console.error(`Error storing data for ${clientName}:`, error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

const getSubmittedData = async(req, res) =>{
    const { inputs , clientName } = req.body;
    
    try {
        const clientData = await SubmitData.findOne({ clientName }, { _id: false });

        if (!clientData) {
            return res.status(404).json({ message: `Client data not found for ${clientName}` });
        }

        const responseData = [];
        inputs.forEach(input => {
            const lowerInput = input.toLowerCase();
            if (lowerInput.includes('hi') || lowerInput.includes('hello')) {
                responseData.push(...clientData.questions);
            } else if (lowerInput.includes('offer')) {
                responseData.push(...clientData.offers);
            }
        });

        return res.status(200).json(responseData);
    } catch (error) {
        console.error(`Error retrieving client data for ${clientName}:`, error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports = {submitData, getSubmittedData}
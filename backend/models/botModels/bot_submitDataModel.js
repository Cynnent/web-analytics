const mongoose = require('mongoose');

const submitDataSchema = new mongoose.Schema({
    clientName: { type: String, required: true, unique: true },
    questions: [
        {
            question: { type: String, required: true }
        }
    ],
    offers: [
        {
            offer: { type: String, required: true }
        }
    ],
    animations: [
        {
            animation: { type: String, required: true }
        }
    ]
});

const SubmitData = mongoose.model('SubmitData', submitDataSchema);

module.exports = SubmitData;
const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
   longUrl: {
    type: String,
    required: true
   },
   shortUrl:{
    type:String,
    unique:true
}
})

const url = mongoose.model('Url', urlSchema)

module.exports = url;
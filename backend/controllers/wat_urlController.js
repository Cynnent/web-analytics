const Url = require('../models/wat_urlModel');
const shortid = require('shortid');


const createUrl = async (req, res) => {
    const { longUrl } = req.body;
    try {
      let url = await Url.findOne({ longUrl });
      
      if (!url) {
        let shortUrl = shortid.generate().substring(0, 20);
        url = await Url.create({
          longUrl,
          shortUrl,
        });
        res.json({
          message: 'URL created successfully',
          statusCode: 201,
          shortUrl: url.shortUrl,
        });
      } else {
        res.json({
          message: 'Given URL already exists',
          statusCode: 200, 
          shortUrl: url.shortUrl,
        });
      }
    } catch (error) {
      res.json({
        message: 'Internal server error',
        statusCode: 500,
      });
    }
  };

const redirectUrl = async(req,res)=>{
    const {shortUrl} = req.params
    try {
        let data = await Url.findOne({shortUrl})
        if(data){
            await Url.findByIdAndUpdate({_id:data._id})
            res.redirect(data.longUrl);

        }else{
            res.json({
                message:"Url redirect failed",
                statusCode: 200,
            })
        }

    } catch (error) {
        res.json({
            message:'Internal server error',
            statusCode: 500,
        })
    }
};
module.exports = {createUrl, redirectUrl}
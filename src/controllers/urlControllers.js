const urlModel = require('../model/urlModel')
const validUrl = require('valid-url')
const shortId = require('shortid')

const createUrl = async function (req, res) {
    try {
        const longUrl = req.body.longUrl
        if (!longUrl) { return res.status(400).send({ status:false, message: "please provide required input field" }) }
        const baseUrl = "http://localhost:3000"
        if (!validUrl.isUri(baseUrl)) {
            return res.status(400).send({ status: false, message: "invalid base URL" })
        }
        const urlCode = shortId.generate()
        if(!urlCode)  return res.status(400).send({ status: false, message: "urlcode required" })
        const url = await urlModel.findOne({ longUrl: longUrl })
        if (url) {
            return res.status(400).send({ status: false, message: "Long URL already exist in tha db" })
        }
        const shortUrl = baseUrl + '/' + urlCode
        if(!shortUrl)  return res.status(400).send({ status: false, message: "shortUrl required" })
        const newUrl = {
            "longUrl": longUrl,
            "shorturl": shortUrl,
            "urlCode": urlCode
        }
        const createUrl = await urlModel.create(newUrl)
        return res.status(201).send({ status: true, data: newUrl })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }

}



const getUrl = async function(req,res){
    try{
        const urlCode=req.params.urlCode
        const url=await urlModel.findOne({urlCode:urlCode})
       
        if(url){
            return res.status(302).redirect(url.longUrl)
        }
        else{
            return res.status(404).send({status:false, message:"No such URL FOUND"})
        }  
       }catch(err){
           return res.status(500).send({status:true,message:err.message})
       }
}


module.exports.createUrl=createUrl
module.exports.getUrl=getUrl
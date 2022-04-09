const urlModel = require('../model/urlModel')

// const urlModel = require("../models/urlModel")
const shortId = require('shortid')
const validUrl = require('valid-url')


//........................................redis.................................................

const redis = require("redis");

const { promisify } = require("util");

const redisClient = redis.createClient({ host: 'redis-17454.c15.us-east-1-4.ec2.cloud.redislabs.com', port: 17454, username: 'functioup-free-db', password: 'yiIOJJ2luH3yHDzmp0WppDFtuUxn5aqO' });


redisClient.on('connect', () => {
    console.log('connected to redis successfully!');
})

redisClient.on('error', (error) => {
    console.log('Redis connection error :', error);
})

//Connection setup for redis

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);


const isValid = function (value) {
    if (typeof value == undefined || value == null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true
}
//...........................................................create short url...................................................


const createUrl = async function (req, res) {
    try {

        const longUrl1 = req.body
        // console.log(longUrl1)

        if (Object.keys(longUrl1).length == 0) { return res.status(400).send({ status: false, message: "please input some data in body" }) }

        const { longUrl } = longUrl1

        if (!isValid(longUrl)) {
            return res.status(400).send({ status: false, message: "Long URL required" })
        }

        if (!(/^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/.test(longUrl))) {
            return res.status(400).send({ status: false, message: "Invalid LongURL" })
        }

        if (!longUrl) {

            return res.status(400).send({ status: false, message: "please provide required input field" })

        }

        const baseUrl = "http://localhost:3000"

        if (!validUrl.isUri(baseUrl)) {

            return res.status(400).send({ status: false, message: "invalid base URL" })

        }

        const cahcedUrlData = await GET_ASYNC(`${longUrl}`)
        const cahcedUrlData1 = JSON.parse(cahcedUrlData)

        if (cahcedUrlData) {

            return res.status(200).send({ status: "true, data from cache", data: cahcedUrlData1 })

        }

        let urlPresent = await urlModel.findOne({ longUrl: longUrl }).select({ _id: 0, createdAt: 0, updatedAt: 0, __v: 0 })

        if (urlPresent) {



            res.status(200).send({ status: true, data: newOne.longUrl })

        }

        const urlCode = shortId.generate()

        const url = await urlModel.findOne({ urlCode: urlCode })

        if (url) {

            return res.status(400).send({ status: false, message: "urlCode already exist in tha db" })

        }

        const shortUrl = baseUrl + '/' + urlCode

        const dupshortUrl = await urlModel.findOne({ shortUrl: shortUrl })

        if (dupshortUrl) {

            return res.status(400).send({ status: false, message: "shortUrl already exist in tha db" })

        }

        const newUrl = {
            longUrl: longUrl,
            shortUrl: shortUrl,
            urlCode: urlCode
        }


        const createUrl = await urlModel.create(newUrl)

        await SET_ASYNC(`${longUrl}`, JSON.stringify(newUrl))

        // let newOne = JSON.parse(longUrl1)
        // await SET_ASYNC(`${urlCode}`, JSON.stringify(newUrl.longUrl))

        return res.status(201).send({ status: true, data: newUrl })


    }

    catch (err) {

        return res.status(500).send({ status: false, message: err.message })

    }

}



//..............................................get by params.....................................


const getUrl = async function (req, res) {
    try {
        const urlCode = req.params.urlCode

        if (!urlCode) { return res.status(400).send({ status: false, message: "urlCode required" }) }


        if (!shortId.isValid(urlCode)) { return res.status(400).send({ status: false, message: "Invalid urlCode" }) }

        let cahcedUrlCode = await GET_ASYNC(`${urlCode}`)

        if (cahcedUrlCode) {

            return res.status(302).redirect(JSON.parse(cahcedUrlCode))

        }
        const url = await urlModel.findOne({ urlCode: urlCode })

        if (url) {
            SET_ASYNC(`${urlCode}`, JSON.stringify(url.longUrl))

            return res.status(200).redirect(url.longUrl)

        }
        else {
            return res.status(404).send({ status: false, message: "No such URL FOUND" })
        }
    } catch (err) {
        return res.status(500).send({ status: true, message: err.message })
    }
}


module.exports.createUrl = createUrl
module.exports.getUrl = getUrl

// const validUrl = require('valid-url')
// const shortId = require('shortid')

// const redis = require("redis");

// const { promisify } = require("util");




// // Connect to redis

// const redisClient = redis.createClient(

//     10386,

//     "redis-10386.c212.ap-south-1-1.ec2.cloud.redislabs.com",

//     { no_ready_check: true }

// );



// redisClient.auth("BPZINXNf82UMtUxBK2LwZyr38pcyFjNV", function (err) {

//     if (err) throw err;

// });



// redisClient.on("connect", async function () {

//     console.log("Connected to Redis..");

// });





// //1. connect to the server

// //2. use the commands :



// //Connection setup for redis



// const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);

// const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);


// const createUrl = async function (req, res) {
//     try {
//         const longUrl = req.body.longUrl
//         if (!longUrl) { return res.status(400).send({ status: false, message: "please provide required input field" }) }
//         //let existUrl = await urlModel.findOne({longUrl:longUrl})
//         // if(existUrl) return res.status(201).send({ status: true, data: existUrl })
//         const baseUrl = "http://localhost:3000"
//         if (!validUrl.isUri(baseUrl)) {
//             return res.status(400).send({ status: false, message: "invalid base URL" })
//         }
//         const cahcedUrlData = await GET_ASYNC(`${longUrl}`)
//         if (cahcedUrlData) {
//             return res.status(200).send({ status: "true", data: cahcedUrlData })
//         }
//         let urlPresent = await urlModel.findOne({ longUrl: longUrl }).select({ _id: 0, createdAt: 0, updatedAt: 0, __v: 0 })
//         if (urlPresent) {
//             await SET_ASYNC(`${longUrl}`, JSON.stringify(urlPresent))
//             return res.status(200).send({ status: true, data: urlPresent })
//         }
//         const urlCode = shortId.generate()
//         const url = await urlModel.findOne({ urlCode: urlCode })
//         if (url) {
//             return res.status(400).send({ status: false, message: "urlCode already exist in tha db" })
//         }
//         const shortUrl = baseUrl + '/' + urlCode
//         const dupshortUrl = await urlModel.findOne({ shortUrl: shortUrl })
//         if (dupshortUrl) {
//             return res.status(400).send({ status: false, message: "shortUrl already exist in tha db" })
//         }
//         const newUrl = {
//             longUrl: longUrl,
//             shortUrl: shortUrl,
//             urlCode: urlCode
//         }
//         // console.log(newUrl)
//         const createUrl = await urlModel.create(newUrl)
//         return res.status(201).send({ status: true, data: newUrl })
//     }
//     catch (err) {
//         return res.status(500).send({ status: false, message: err.message })
//     }

// }



// const getUrl = async function (req, res) {
//     try {
//         const urlCode = req.params.urlCode
//         let cahcedUrlCode = await GET_ASYNC(`${urlCode}`)
//         //   console.log(cahcedUrlCode)
//         if (cahcedUrlCode) {

//             return res.status(200).redirect(JSON.parse(cahcedUrlCode))

//         }
//         const url = await urlModel.findOne({ urlCode: urlCode })

//         if (url) {
//             SET_ASYNC(`${urlCode}`, JSON.stringify(url.longUrl))

//             return res.status(200).redirect(url.longUrl)

//         }
//         else {
//             return res.status(404).send({ status: false, message: "No such URL FOUND" })
//         }
//     } catch (err) {
//         return res.status(500).send({ status: true, message: err.message })
//     }
// }


// module.exports.createUrl = createUrl
// module.exports.getUrl = getUrl
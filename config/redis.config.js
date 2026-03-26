const {createClient} = require("redis")

const redisClient = createClient();

redisClient.on('error' , err => console.log('Redis client error ' , err))

async function connectRedis() {
    await redisClient.connect();
    console.log("Connected");
}

connectRedis();

module.exports = redisClient;
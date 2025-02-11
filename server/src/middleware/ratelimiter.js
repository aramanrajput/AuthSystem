
const redis = require('../config/redis')
const ratelimiter = async (req,res,next) =>{
  const ip = req.ip;

  // Increment request count
  const requests = await redis.incr(ip);
  
  // Always reset TTL on every request
  let ttl = await redis.ttl(ip);
  console.log(ttl,requests,"&&&&&&&&&&")
  if (ttl === -1) {  // If TTL is not set, reset it
      await redis.expire(ip, 60);
      ttl = 60;
  }
  
  if (requests > 20) {
      return res.status(429).json({
          message: 'Too many requests, please try again later',
          callsInAMinute: requests,
          ttl
      });
  } else {
      req.requests = requests;
      req.ttl = ttl;
      next();
  }
  

}


module.exports = ratelimiter;

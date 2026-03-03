import Client from "../services/redisClient.js";
const trackActivity=async(req, res,next)=>{

    const userId= req.headers["user-id"]
if(req.path.startsWith('/status')){
return next();
}

if(userId){
        const now = Math.floor(Date.now()/1000) // Unix timestamp in seconds
    await Client.set(`User: ${userId}: last seen`, now);
    console.log(`User: ${userId} is activate at ${now}`);
}
next();
}
export default trackActivity;

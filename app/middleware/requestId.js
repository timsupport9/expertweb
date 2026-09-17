const crypto=require("node:crypto");
module.exports=function requestId(req,res,next){const incoming=req.headers["x-request-id"]||req.headers["x-correlation-id"]||"";const id=typeof incoming==="string"&&incoming.trim().length>0?incoming.trim().slice(0,128):crypto.randomUUID();req.id=id;res.setHeader("X-Request-Id",id);next();};

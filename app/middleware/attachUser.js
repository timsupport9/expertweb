module.exports=function attachUser(){return function attachUserMiddleware(req,res,next){req.user=(req.session&&req.session.user)||null;res.locals.user=req.user;next();};};

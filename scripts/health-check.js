require("dotenv").config();
const db=require("../app/config/database");
(async()=>{try{await db.ping();console.log('ExpertHub database: OK')}catch(e){console.error('ExpertHub database: FAILED',e.message);process.exitCode=1}finally{await db.close()}})();

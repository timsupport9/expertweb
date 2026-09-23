require("dotenv").config();
const fs=require("fs"),path=require("path");
const db=require("../app/config/database");
(async()=>{try{const dir=path.join(__dirname,"..","Database");const files=fs.readdirSync(dir).filter(f=>f.endsWith('.sql')).sort();for(const file of files){const sql=fs.readFileSync(path.join(dir,file),'utf8');console.log(`Running ${file}`);await db.query(sql);}console.log('Database migration complete.')}catch(e){console.error(e);process.exitCode=1}finally{await db.close()}})();

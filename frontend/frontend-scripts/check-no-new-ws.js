import fs from 'fs'
import path from 'path'

function walk(dir){
  const files = fs.readdirSync(dir);
  for(const f of files){
    const p = path.join(dir,f);
    const s = fs.statSync(p);
    if(s.isDirectory()) walk(p);
    else if(/\.tsx?$/.test(f)){
      const c = fs.readFileSync(p,'utf8');
      if(c.includes('new WebSocket(')){
        console.error(`禁止在组件中直接 new WebSocket()： ${p}`);
        process.exit(1);
      }
    }
  }
}
walk(path.join(process.cwd(),'frontend','src'));
console.log('check-no-new-ws passed');
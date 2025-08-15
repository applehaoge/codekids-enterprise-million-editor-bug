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

// 支持从不同 cwd 调用：尝试几种候选路径
const candidates = [
  path.join(process.cwd(),'frontend','src'),
  path.join(process.cwd(),'src'),
  path.join(path.dirname(new URL(import.meta.url).pathname),'..','src')
];
let found = false;
for(const c of candidates){
  try{
    if(fs.existsSync(c)){
      walk(c);
      found = true;
      break;
    }
  }catch(e){}
}
if(!found){
  console.error('未找到 frontend/src 目录，请从仓库根或 frontend 目录运行该脚本');
  process.exit(1);
}
console.log('check-no-new-ws passed');
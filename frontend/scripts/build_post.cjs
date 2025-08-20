const fs = require('fs');
const path = require('path');
(async ()=>{
  try{
    const root = path.resolve(__dirname, '..');
    const dist = path.join(root, 'dist');
    // rm -rf dist
    if(fs.existsSync(dist)){
      fs.rmSync(dist, { recursive: true, force: true });
    }
    // run vite build
    const { execSync } = require('child_process');
    execSync('pnpm build:client', { stdio: 'inherit' });
    // copy package.json
    fs.copyFileSync(path.join(root, 'package.json'), path.join(dist, 'package.json'));
    // touch dist/build.flag
    fs.writeFileSync(path.join(dist, 'build.flag'), '');
    console.log('build_post.cjs completed');
  }catch(e){ console.error(e); process.exit(1) }
})();

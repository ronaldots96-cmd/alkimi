import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const kids=path.resolve(root,'../../../Motion Kids/alkimi-motion');
const modules=path.join(kids,'node_modules');
const require=createRequire(path.join(kids,'package.json'));
const {bundle}=require('@remotion/bundler');
const {getCompositions,renderStill,openBrowser,renderMedia}=require('@remotion/renderer');
const sharp=require('sharp');
const plan=JSON.parse(fs.readFileSync(path.join(root,'data/edit-plan.json')));
for(const d of ['review/stills','review/storyboards','review/previews','_cache'])fs.mkdirSync(path.join(root,d),{recursive:true});
const browserExecutable=path.join(modules,'.remotion/chrome-headless-shell/win64/chrome-headless-shell-win64/chrome-headless-shell.exe');
const serveUrl=await bundle({entryPoint:path.join(root,'src/index.tsx'),rootDir:root,publicDir:path.join(root,'public'),outDir:path.join(root,'_cache/bundle'),enableCaching:false,webpackOverride:cfg=>({...cfg,resolve:{...cfg.resolve,modules:[modules,'node_modules'],alias:{...cfg.resolve?.alias,react:path.join(modules,'react'),'react-dom':path.join(modules,'react-dom'),remotion:path.join(modules,'remotion')}}})});
const browser=await openBrowser('chrome',{browserExecutable});
try{
 const compositions=await getCompositions(serveUrl,{puppeteerInstance:browser,browserExecutable});
 fs.writeFileSync(path.join(root,'data/compositions.json'),JSON.stringify(compositions,null,2));
 for(const c of process.argv.includes('--extras')?[]:plan.concepts){
  for(const format of ['9x16','4x5']){
   const composition=compositions.find(v=>v.id===`women-${c.id}-${format}`);const frames=[];
   for(const s of c.scenes){
    const times=s.kind==='carousel'?s.photos.map((_,i)=>s.from+(i+.6)*(s.to-s.from)/s.photos.length):[s.kind==='cta'?s.to-.5:(s.from+s.to)/2];
    for(let k=0;k<times.length;k++){
     const frame=Math.round(times[k]*30),file=`${c.id}-${format}-${s.id}-${k}.jpg`;
     await renderStill({serveUrl,composition,output:path.join(root,'review/stills',file),frame,scale:.5,imageFormat:'jpeg',jpegQuality:94,puppeteerInstance:browser,browserExecutable});
     frames.push({file,label:`${s.id}${s.kind==='carousel'?` ${k+1}/3`:''} · ${(frame/30).toFixed(1)}s`});
    }
   }
   const W=270,H=format==='9x16'?480:338,cols=4,gap=16,labelH=38;const parts=[];
   for(let i=0;i<frames.length;i++){
    const x=gap+(i%cols)*(W+gap),y=70+Math.floor(i/cols)*(H+labelH+gap);
    parts.push({input:await sharp(path.join(root,'review/stills',frames[i].file)).resize(W,H).jpeg().toBuffer(),left:x,top:y});
    parts.push({input:Buffer.from(`<svg width="${W}" height="${labelH}"><text x="3" y="25" fill="#F2E3E0" font-family="Arial" font-size="17">${frames[i].label}</text></svg>`),left:x,top:y+H});
   }
   parts.push({input:Buffer.from(`<svg width="1100" height="55"><text x="18" y="37" fill="#F9E199" font-family="Arial" font-size="27">${c.title.toUpperCase()} · ${format} · STORYBOARD / SEM VOZ</text></svg>`),left:0,top:0});
   await sharp({create:{width:cols*(W+gap)+gap,height:70+Math.ceil(frames.length/cols)*(H+labelH+gap),channels:3,background:'#17191e'}}).composite(parts).jpeg({quality:93}).toFile(path.join(root,`review/storyboards/${c.id}-${format}.jpg`));
   console.log(`Storyboard ready: ${c.id} ${format} (${frames.length} frames)`);
  }
 }
 const community=compositions.find(c=>c.id==='women-community-9x16');
 await renderStill({serveUrl,composition:{...community,props:{...community.props,opening:'type'}},output:path.join(root,'review/stills/community-opening-type.jpg'),frame:60,inputProps:{concept:'community',opening:'type',debugSafeArea:false},scale:.5,imageFormat:'jpeg',puppeteerInstance:browser,browserExecutable});
 await renderStill({serveUrl,composition:{...community,props:{...community.props,debugSafeArea:true}},output:path.join(root,'review/stills/community-safe-area.jpg'),frame:60,inputProps:{concept:'community',opening:'photo',debugSafeArea:true},scale:.5,imageFormat:'jpeg',puppeteerInstance:browser,browserExecutable});
 if(process.argv.includes('--motion')){
  console.log('Rendering silent Community motion study');
  await renderMedia({serveUrl,composition:community,outputLocation:path.join(root,'review/previews/community-motion-study-silent.mp4'),codec:'h264',crf:22,scale:.5,concurrency:2,pixelFormat:'yuv420p',puppeteerInstance:browser,browserExecutable,muted:true,onProgress:({progress})=>{if(progress===1) console.log('Motion study complete');}});
 }
}finally{await browser.close({silent:true});}
